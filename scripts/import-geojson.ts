#!/usr/bin/env ts-node

import fs from "node:fs";
import path from "node:path";

import { Client } from "pg";

type GeoJsonGeometry = {
  type: string;
  coordinates: unknown;
  [key: string]: unknown;
};

type GeoJsonFeature = {
  type?: string;
  geometry?: GeoJsonGeometry | null;
  properties?: Record<string, unknown>;
};

type GeoJsonDocument = {
  type?: string;
  features?: GeoJsonFeature[];
};

type ParcelRow = {
  il: string;
  ada: string;
  parsel: string;
  ilce: string | null;
  alan: number | null;
  mevkii: string | null;
  nitelik: string | null;
  pafta: string | null;
  mahalle: string | null;
  geom: string;
};

type TableLayout = {
  insertColumns: string[];
  conflictColumns: string[];
  geometryColumn: string;
};

const BATCH_SIZE = 100;
const GEOJSON_FILE_PATTERN = /\.(geo)?json$/i;

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const normalizedLine = line.startsWith("export ") ? line.slice(7).trim() : line;
    const equalsIndex = normalizedLine.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = normalizedLine.slice(0, equalsIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = normalizedLine.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function loadProjectEnv() {
  const projectRoot = path.resolve(__dirname, "..");
  loadEnvFile(path.join(projectRoot, ".env.local"));
  loadEnvFile(path.join(projectRoot, ".env"));
}

function getDirectUrl(): string {
  const directUrl = process.env.DIRECT_URL?.trim();

  if (!directUrl) {
    throw new Error("DIRECT_URL bulunamadı. Lütfen .env veya .env.local içine ekleyin.");
  }

  return directUrl;
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getPropertyValue(properties: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(properties, key)) {
      const value = properties[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }

  return undefined;
}

function normalizeText(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function parseTurkishNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function collectGeoJsonFiles(targetPath: string): string[] {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Girilen klasör veya dosya bulunamadı: ${targetPath}`);
  }

  const stat = fs.statSync(targetPath);

  if (stat.isFile()) {
    return GEOJSON_FILE_PATTERN.test(targetPath) ? [targetPath] : [];
  }

  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectGeoJsonFiles(entryPath));
      continue;
    }

    if (entry.isFile() && GEOJSON_FILE_PATTERN.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function readGeoJsonDocument(filePath: string): GeoJsonDocument {
  const rawContent = fs.readFileSync(filePath, "utf8");

  try {
    return JSON.parse(rawContent) as GeoJsonDocument;
  } catch (error) {
    throw new Error(`GeoJSON okunamadı: ${filePath} - ${(error as Error).message}`);
  }
}

function mapFeatureToParcelRow(feature: GeoJsonFeature, sourceFile: string): ParcelRow | null {
  const properties = isRecord(feature.properties) ? feature.properties : null;
  const geometry = feature.geometry;

  if (!properties || !geometry || !isRecord(geometry)) {
    console.warn(`Eksik properties veya geometry atlandı: ${sourceFile}`);
    return null;
  }

  const il = normalizeText(getPropertyValue(properties, "Il", "il", "İl"));
  const ilce = normalizeText(getPropertyValue(properties, "Ilce", "ilce", "İlce"));
  const ada = normalizeText(getPropertyValue(properties, "Ada", "ada"));
  const parsel = normalizeText(getPropertyValue(properties, "ParselNo", "parsel", "Parsel", "parselNo"));
  const alan = parseTurkishNumber(getPropertyValue(properties, "Alan", "alan"));
  const mevkii = normalizeText(getPropertyValue(properties, "Mevkii", "mevkii"));
  const nitelik = normalizeText(getPropertyValue(properties, "Nitelik", "nitelik"));
  const pafta = normalizeText(getPropertyValue(properties, "Pafta", "pafta"));
  const mahalle = normalizeText(getPropertyValue(properties, "Mahalle", "mahalle"));

  if (!il || !ada || !parsel) {
    console.warn(
      `Zorunlu alanlar eksik olduğu için kayıt atlandı: ${sourceFile} (${il ?? "?"} / ${ada ?? "?"} / ${parsel ?? "?"})`
    );
    return null;
  }

  return {
    il,
    ada,
    parsel,
    ilce,
    alan,
    mevkii,
    nitelik,
    pafta,
    mahalle,
    geom: JSON.stringify(geometry)
  };
}

function resolveTableLayout(columns: string[]): TableLayout {
  const lookup = new Map(columns.map((column) => [column.toLowerCase(), column]));
  const requiredColumns = ["il", "ada", "parsel"] as const;
  const optionalColumns = ["ilce", "alan", "mevkii", "nitelik", "pafta", "mahalle"] as const;
  const geometryCandidates = ["geom", "geometry", "the_geom"] as const;

  const missingRequired = requiredColumns.filter((column) => !lookup.has(column));
  if (missingRequired.length > 0) {
    throw new Error(
      `parcels tablosunda zorunlu kolonlar bulunamadı: ${missingRequired.join(", ")}`
    );
  }

  const geometryColumn = geometryCandidates.find((column) => lookup.has(column));
  if (!geometryColumn) {
    throw new Error('parcels tablosunda geometry kolonu bulunamadı. "geom" veya "geometry" bekleniyordu.');
  }

  const insertColumns = [
    ...requiredColumns.map((column) => lookup.get(column)!),
    ...optionalColumns.flatMap((column) => (lookup.has(column) ? [lookup.get(column)!] : [])),
    lookup.get(geometryColumn)!
  ];

  return {
    insertColumns,
    conflictColumns: requiredColumns.map((column) => lookup.get(column)!),
    geometryColumn: lookup.get(geometryColumn)!
  };
}

function resolveColumnValue(row: ParcelRow, columnName: string, geometryColumnName: string): unknown {
  const normalizedColumn = columnName.toLowerCase();

  if (normalizedColumn === geometryColumnName.toLowerCase()) {
    return row.geom;
  }

  switch (normalizedColumn) {
    case "il":
      return row.il;
    case "ada":
      return row.ada;
    case "parsel":
      return row.parsel;
    case "ilce":
      return row.ilce;
    case "alan":
      return row.alan;
    case "mevkii":
      return row.mevkii;
    case "nitelik":
      return row.nitelik;
    case "pafta":
      return row.pafta;
    case "mahalle":
      return row.mahalle;
    default:
      return null;
  }
}

function buildInsertQuery(rows: ParcelRow[], layout: TableLayout) {
  const values: unknown[] = [];
  const insertValues = rows
    .map((row) => {
      const rowValues = layout.insertColumns.map((columnName) => {
        const value = resolveColumnValue(row, columnName, layout.geometryColumn);
        values.push(value);
        const placeholderIndex = values.length;

        if (columnName.toLowerCase() === layout.geometryColumn.toLowerCase()) {
          return `ST_GeomFromGeoJSON($${placeholderIndex})`;
        }

        return `$${placeholderIndex}`;
      });

      return `(${rowValues.join(", ")})`;
    })
    .join(", ");

  const text = [
    `INSERT INTO ${quoteIdentifier("parcels")} (${layout.insertColumns.map(quoteIdentifier).join(", ")})`,
    `VALUES ${insertValues}`,
    `ON CONFLICT (${layout.conflictColumns.map(quoteIdentifier).join(", ")}) DO NOTHING`
  ].join(" ");

  return { text, values };
}

async function insertRows(client: Client, rows: ParcelRow[], layout: TableLayout): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  try {
    const query = buildInsertQuery(rows, layout);
    const result = await client.query(query.text, query.values);
    return result.rowCount ?? 0;
  } catch (error) {
    if (rows.length === 1) {
      const row = rows[0];
      console.warn(
        `Tekil kayıt atlandı: ${row.il} / Ada ${row.ada} / Parsel ${row.parsel} - ${(error as Error).message}`
      );
      return 0;
    }

    console.warn(
      `Toplu insert başarısız oldu, tek tek deneniyor (${rows.length} kayıt): ${(error as Error).message}`
    );

    let inserted = 0;
    for (const row of rows) {
      inserted += await insertRows(client, [row], layout);
    }

    return inserted;
  }
}

function groupRowsByProvince(rows: ParcelRow[]): Map<string, ParcelRow[]> {
  const grouped = new Map<string, ParcelRow[]>();

  for (const row of rows) {
    const bucket = grouped.get(row.il) ?? [];
    bucket.push(row);
    grouped.set(row.il, bucket);
  }

  return grouped;
}

async function main() {
  const inputPathArg = process.argv[2];

  if (!inputPathArg) {
    throw new Error("Kullanım: npm run import-geojson -- <klasor-yolu>");
  }

  loadProjectEnv();

  const directUrl = getDirectUrl();
  const parsedUrl = new URL(directUrl);
  const shouldUseSsl = !["localhost", "127.0.0.1", "::1"].includes(parsedUrl.hostname);

  const client = new Client({
    connectionString: directUrl,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined
  });

  const inputPath = path.resolve(process.cwd(), inputPathArg);
  const files = collectGeoJsonFiles(inputPath);

  if (files.length === 0) {
    console.log("İçe aktarılacak GeoJSON dosyası bulunamadı.");
    return;
  }

  await client.connect();

  try {
    const columnResult = await client.query<{ column_name: string }>(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'parcels'
    `);

    const layout = resolveTableLayout(columnResult.rows.map((row) => row.column_name));
    const parsedRows: ParcelRow[] = [];
    let skippedFiles = 0;

    for (const filePath of files) {
      const document = readGeoJsonDocument(filePath);
      if (!Array.isArray(document.features)) {
        console.warn(`features dizisi bulunamadı, dosya atlandı: ${filePath}`);
        skippedFiles += 1;
        continue;
      }

      for (const feature of document.features) {
        const row = mapFeatureToParcelRow(feature, filePath);
        if (row) {
          parsedRows.push(row);
        }
      }
    }

    if (parsedRows.length === 0) {
      console.log("İçe aktarılacak geçerli parsel bulunamadı.");
      return;
    }

    const groupedRows = groupRowsByProvince(parsedRows);
    let totalInserted = 0;

    for (const [province, rows] of groupedRows.entries()) {
      const total = rows.length;
      let processed = 0;

      for (let index = 0; index < rows.length; index += BATCH_SIZE) {
        const batch = rows.slice(index, index + BATCH_SIZE);
        totalInserted += await insertRows(client, batch, layout);
        processed += batch.length;
        console.log(`${province}: ${processed}/${total} parsel import edildi...`);
      }
    }

    console.log(
      `İşlem tamamlandı. ${parsedRows.length} kayıt işlendi, ${totalInserted} satır eklendi, ${skippedFiles} dosya atlandı.`
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("GeoJSON import işlemi başarısız oldu:", error);
  process.exitCode = 1;
});
