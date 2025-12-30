import fs from "node:fs";
import path from "node:path";

function loadDotEnvIfPresent(fileName) {
  const envPath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const normalized = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length)
      : trimmed;
    const eqIdx = normalized.indexOf("=");
    if (eqIdx === -1) continue;
    const key = normalized.slice(0, eqIdx).trim();
    let value = normalized.slice(eqIdx + 1).trim();
    if (!key) continue;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function cleanEnvValue(value) {
  if (!value) return undefined;
  const v = String(value).trim();
  if (!v) return undefined;
  if (/^your_.*_here$/i.test(v)) return undefined;
  return v;
}

// Load local env for this Node script (Next.js does this automatically; Node doesn't)
loadDotEnvIfPresent(".env.local");
loadDotEnvIfPresent(".env");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const [key, rawValue] = token.replace(/^--/, "").split("=");
    if (rawValue !== undefined) {
      args[key] = rawValue;
    } else {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

const args = parseArgs(process.argv);

const endpoint = cleanEnvValue(
  args.endpoint ||
    process.env.APPWRITE_ENDPOINT ||
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
);
const projectId = cleanEnvValue(
  args.project ||
    args.projectId ||
    process.env.APPWRITE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
);
const apiKey = cleanEnvValue(
  args.key || args.apiKey || process.env.APPWRITE_API_KEY
);

const databaseId =
  cleanEnvValue(
    args.databaseId || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
  ) || "resume-builder";
const resumesCollectionId =
  cleanEnvValue(
    args.resumesCollectionId ||
      process.env.NEXT_PUBLIC_APPWRITE_RESUMES_COLLECTION_ID
  ) || "resumes";
const usersCollectionId =
  cleanEnvValue(
    args.usersCollectionId ||
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID
  ) || "users";
const sharedResumesCollectionId =
  cleanEnvValue(
    args.sharedResumesCollectionId ||
      process.env.NEXT_PUBLIC_APPWRITE_SHARED_RESUMES_COLLECTION_ID
  ) || "shared-resumes";
const bucketId =
  cleanEnvValue(
    args.bucketId || process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID
  ) || "resume-files";

const databaseName = args.databaseName || "Resume Builder";
const resumesCollectionName = args.resumesCollectionName || "Resumes";
const usersCollectionName = args.usersCollectionName || "Users";
const sharedResumesCollectionName =
  args.sharedResumesCollectionName || "Shared Resumes";
const bucketName = args.bucketName || "Resume Files";

const writeEnv = args.writeEnv !== "false"; // default true
const createBucket = args.createBucket !== "false"; // default true

if (!endpoint || !projectId || !apiKey) {
  console.error(
    "Missing required values. Provide --endpoint, --project, --key (or set APPWRITE_API_KEY env)."
  );
  console.error("Example:");
  console.error(
    "  APPWRITE_API_KEY=xxxx node scripts/setup-appwrite.mjs --endpoint https://cloud.appwrite.io/v1 --project <projectId>"
  );
  process.exit(1);
}

const baseUrl = endpoint.replace(/\/$/, "");

async function request(method, apiPath, body) {
  const url = `${baseUrl}${apiPath}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": projectId,
      "X-Appwrite-Key": apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const message =
      json?.message || json?.error || text || `${res.status} ${res.statusText}`;
    const error = new Error(message);
    error.status = res.status;
    error.body = json;
    throw error;
  }

  return json;
}

async function ensureDatabase() {
  try {
    const existing = await request(
      "GET",
      `/databases/${encodeURIComponent(databaseId)}`
    );
    return existing.$id;
  } catch (err) {
    if (err.status !== 404) throw err;
    const created = await request("POST", "/databases", {
      databaseId,
      name: databaseName,
    });
    return created.$id;
  }
}

async function ensureCollection(dbId, collectionId, name) {
  try {
    const existing = await request(
      "GET",
      `/databases/${encodeURIComponent(dbId)}/collections/${encodeURIComponent(
        collectionId
      )}`
    );
    return existing.$id;
  } catch (err) {
    if (err.status !== 404) throw err;

    const permissions = [
      'create("users")',
      'read("users")',
      'update("users")',
      'delete("users")',
    ];

    const created = await request(
      "POST",
      `/databases/${encodeURIComponent(dbId)}/collections`,
      {
        collectionId,
        name,
        permissions,
        documentSecurity: true,
        enabled: true,
      }
    );
    return created.$id;
  }
}

// Special collection for shared resumes with public read access
async function ensurePublicReadCollection(dbId, collectionId, name) {
  try {
    const existing = await request(
      "GET",
      `/databases/${encodeURIComponent(dbId)}/collections/${encodeURIComponent(
        collectionId
      )}`
    );
    return existing.$id;
  } catch (err) {
    if (err.status !== 404) throw err;

    // Allow public read (any user can view shared resumes)
    // But only authenticated users can create/update/delete
    const permissions = [
      'create("users")',
      'read("any")',
      'update("users")',
      'delete("users")',
    ];

    const created = await request(
      "POST",
      `/databases/${encodeURIComponent(dbId)}/collections`,
      {
        collectionId,
        name,
        permissions,
        documentSecurity: true,
        enabled: true,
      }
    );
    return created.$id;
  }
}

async function ensureStringAttribute(dbId, collectionId, key, size, required) {
  try {
    await request(
      "POST",
      `/databases/${encodeURIComponent(dbId)}/collections/${encodeURIComponent(
        collectionId
      )}/attributes/string`,
      {
        key,
        size,
        required,
        array: false,
      }
    );
  } catch (err) {
    // 409 already exists, or 400 when attribute is being built; ignore both
    if (err.status === 409 || err.status === 400) return;
    throw err;
  }
}

async function ensureBooleanAttribute(dbId, collectionId, key, required) {
  try {
    await request(
      "POST",
      `/databases/${encodeURIComponent(dbId)}/collections/${encodeURIComponent(
        collectionId
      )}/attributes/boolean`,
      {
        key,
        required,
        array: false,
      }
    );
  } catch (err) {
    if (err.status === 409 || err.status === 400) return;
    throw err;
  }
}

async function ensureIntegerAttribute(
  dbId,
  collectionId,
  key,
  required,
  defaultValue
) {
  try {
    await request(
      "POST",
      `/databases/${encodeURIComponent(dbId)}/collections/${encodeURIComponent(
        collectionId
      )}/attributes/integer`,
      {
        key,
        required,
        array: false,
        default: defaultValue,
      }
    );
  } catch (err) {
    if (err.status === 409 || err.status === 400) return;
    throw err;
  }
}

async function ensureIndex(dbId, collectionId, key, type, attributes) {
  try {
    await request(
      "POST",
      `/databases/${encodeURIComponent(dbId)}/collections/${encodeURIComponent(
        collectionId
      )}/indexes`,
      {
        key,
        type,
        attributes,
        orders: ["ASC"],
      }
    );
  } catch (err) {
    if (err.status === 409 || err.status === 400) return;
    throw err;
  }
}

async function ensureBucket() {
  try {
    const existing = await request(
      "GET",
      `/storage/buckets/${encodeURIComponent(bucketId)}`
    );
    return existing.$id;
  } catch (err) {
    if (err.status !== 404) throw err;

    const permissions = [
      'create("users")',
      'read("users")',
      'update("users")',
      'delete("users")',
    ];

    const created = await request("POST", `/storage/buckets`, {
      bucketId,
      name: bucketName,
      permissions,
      enabled: true,
      maximumFileSize: 50_000_000,
      allowedFileExtensions: [],
      compression: "none",
      encryption: true,
      antivirus: false,
    });

    return created.$id;
  }
}

function upsertEnv(content, key, value) {
  const line = `${key}=${value}`;
  const regex = new RegExp(
    `^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=.*$`,
    "m"
  );
  if (regex.test(content)) {
    return content.replace(regex, line);
  }
  const trimmed = content.trimEnd();
  return `${trimmed}\n${line}\n`;
}

async function main() {
  const dbId = await ensureDatabase();
  await ensureCollection(dbId, resumesCollectionId, resumesCollectionName);
  await ensureCollection(dbId, usersCollectionId, usersCollectionName);
  // Use public read collection for shared resumes so anyone can view
  await ensurePublicReadCollection(
    dbId,
    sharedResumesCollectionId,
    sharedResumesCollectionName
  );

  // Resumes schema
  await ensureStringAttribute(dbId, resumesCollectionId, "userId", 255, true);
  await ensureStringAttribute(dbId, resumesCollectionId, "title", 255, true);
  await ensureStringAttribute(dbId, resumesCollectionId, "data", 100000, true);
  await ensureBooleanAttribute(dbId, resumesCollectionId, "isDefault", false);
  await ensureIndex(dbId, resumesCollectionId, "userId_idx", "key", ["userId"]);

  // Users schema (optional for future)
  await ensureStringAttribute(dbId, usersCollectionId, "email", 255, true);
  await ensureStringAttribute(dbId, usersCollectionId, "name", 255, false);
  await ensureStringAttribute(dbId, usersCollectionId, "plan", 32, false);

  // Shared Resumes schema
  await ensureStringAttribute(
    dbId,
    sharedResumesCollectionId,
    "shareId",
    32,
    true
  );
  await ensureStringAttribute(
    dbId,
    sharedResumesCollectionId,
    "userId",
    255,
    true
  );
  await ensureStringAttribute(
    dbId,
    sharedResumesCollectionId,
    "data",
    100000,
    true
  );
  await ensureStringAttribute(
    dbId,
    sharedResumesCollectionId,
    "template",
    32,
    true
  );
  await ensureStringAttribute(
    dbId,
    sharedResumesCollectionId,
    "fontFamily",
    32,
    true
  );
  await ensureStringAttribute(
    dbId,
    sharedResumesCollectionId,
    "density",
    32,
    true
  );
  await ensureStringAttribute(
    dbId,
    sharedResumesCollectionId,
    "headerLayout",
    32,
    true
  );
  await ensureBooleanAttribute(
    dbId,
    sharedResumesCollectionId,
    "showDividers",
    true
  );
  await ensureStringAttribute(
    dbId,
    sharedResumesCollectionId,
    "colorTheme",
    32,
    true
  );
  await ensureIntegerAttribute(
    dbId,
    sharedResumesCollectionId,
    "viewCount",
    false,
    0
  );
  await ensureIndex(dbId, sharedResumesCollectionId, "shareId_idx", "key", [
    "shareId",
  ]);
  await ensureIndex(dbId, sharedResumesCollectionId, "userId_idx", "key", [
    "userId",
  ]);

  const finalBucketId = createBucket ? await ensureBucket() : "";

  if (writeEnv) {
    const envPath = path.join(process.cwd(), ".env.local");
    const existing = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, "utf8")
      : "";

    let updated = existing || "";
    updated = upsertEnv(updated, "NEXT_PUBLIC_APPWRITE_ENDPOINT", baseUrl);
    updated = upsertEnv(updated, "NEXT_PUBLIC_APPWRITE_PROJECT_ID", projectId);
    updated = upsertEnv(updated, "NEXT_PUBLIC_APPWRITE_DATABASE_ID", dbId);
    updated = upsertEnv(
      updated,
      "NEXT_PUBLIC_APPWRITE_RESUMES_COLLECTION_ID",
      resumesCollectionId
    );
    updated = upsertEnv(
      updated,
      "NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID",
      usersCollectionId
    );
    updated = upsertEnv(
      updated,
      "NEXT_PUBLIC_APPWRITE_SHARED_RESUMES_COLLECTION_ID",
      sharedResumesCollectionId
    );

    if (createBucket) {
      updated = upsertEnv(
        updated,
        "NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID",
        finalBucketId
      );
    }

    // Store admin key for server-side use only (never NEXT_PUBLIC)
    updated = upsertEnv(updated, "APPWRITE_API_KEY", apiKey);

    fs.writeFileSync(envPath, updated, "utf8");
  }

  console.log("✅ Appwrite setup complete");
  console.log(`- Endpoint: ${baseUrl}`);
  console.log(`- Project: ${projectId}`);
  console.log(`- Database ID: ${dbId}`);
  console.log(`- Resumes Collection ID: ${resumesCollectionId}`);
  console.log(`- Users Collection ID: ${usersCollectionId}`);
  console.log(`- Shared Resumes Collection ID: ${sharedResumesCollectionId}`);
  console.log(`- Bucket ID: ${createBucket ? bucketId : "(skipped)"}`);
  console.log(
    writeEnv ? "- Updated: .env.local" : "- .env.local update skipped"
  );
}

main().catch((err) => {
  console.error("❌ Appwrite setup failed:", err?.message || err);
  process.exit(1);
});
