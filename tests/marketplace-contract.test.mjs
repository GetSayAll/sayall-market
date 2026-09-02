import assert from "node:assert/strict";
import { createHash, createPublicKey, generateKeyPairSync, sign } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";

import {
  canonicalJsonBytes,
  canonicalizeJson,
  forbiddenContractPaths,
  isIso8601UtcDateTime,
  isManifestRevoked,
  sha256CanonicalJson,
  unsignedDocument,
  verifySignedDocument
} from "../scripts/marketplace-contract.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadValidator(schemaFile) {
  const schema = JSON.parse(await readFile(path.join(repositoryRoot, schemaFile), "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addFormat("date-time", { type: "string", validate: isIso8601UtcDateTime });
  return ajv.compile(schema);
}

async function draftFixturePublicKey(keyID) {
  const fixture = JSON.parse(
    await readFile(path.join(repositoryRoot, "tests/fixtures/draft-signing-public-keys.json"), "utf8")
  );
  const key = fixture.keys.find((candidate) => candidate.keyID === keyID);
  if (!key || key.algorithm !== "ed25519" || key.format !== "spki-der-base64") {
    return undefined;
  }
  return createPublicKey({
    key: Buffer.from(key.publicKey, "base64"),
    format: "der",
    type: "spki"
  });
}

async function verifyWithDraftFixture(document) {
  const publicKey = await draftFixturePublicKey(document?.signature?.keyID);
  return publicKey ? verifySignedDocument(document, publicKey) : false;
}

function signed(document, keyID, privateKey) {
  const signature = sign(null, canonicalJsonBytes(document), privateKey).toString("base64");
  return { ...document, signature: { algorithm: "ed25519", keyID, value: signature } };
}

function baseManifest() {
  return {
    schemaVersion: "0.1-draft",
    packageID: "com.getsayall.example.fixture",
    packageType: "macro",
    version: "0.1.0",
    status: "draft",
    source: "community",
    author: { authorID: "fixture-author", displayName: "Fixture Author" },
    compatibility: { minimumRemoteMicVersion: "1.9.18" },
    contentPath: "examples/macros/open-codex-and-focus.draft.json",
    contentDigest: `sha256:${"1".repeat(64)}`,
    license: "CC-BY-NC-4.0",
    declaredCapabilities: ["openApplication"],
    verification: { status: "notVerified" }
  };
}

test("canonical JSON 与 SHA-256 不受对象键顺序影响", () => {
  const left = { b: 2, a: { d: [3, 1], c: "值" } };
  const right = { a: { c: "值", d: [3, 1] }, b: 2 };

  assert.equal(canonicalizeJson(left), '{"a":{"c":"值","d":[3,1]},"b":2}');
  assert.equal(sha256CanonicalJson(left), sha256CanonicalJson(right));
  assert.equal(
    sha256CanonicalJson({ a: 1, b: 2 }),
    "sha256:43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777"
  );
});

test("Manifest 与 Catalog Ed25519 签名可验证且拒绝篡改", () => {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const manifest = signed(baseManifest(), "fixture-key-01", privateKey);
  assert.equal(verifySignedDocument(manifest, publicKey), true);
  assert.equal(verifySignedDocument({ ...manifest, version: "0.1.1" }, publicKey), false);

  const catalog = signed(
    {
      schemaVersion: "0.1-draft",
      status: "candidate",
      catalogVersion: 1,
      generatedAt: "2026-09-02T00:00:00Z",
      manifests: [
        {
          manifestPath: "examples/manifests/fixture.draft.json",
          manifestDigest: sha256CanonicalJson(manifest)
        }
      ],
      revocations: { revision: 0, entries: [] }
    },
    "fixture-key-01",
    privateKey
  );
  assert.equal(verifySignedDocument(catalog, publicKey), true);
  assert.equal(verifySignedDocument({ ...catalog, catalogVersion: 2 }, publicKey), false);
  assert.equal(unsignedDocument(catalog).signature, undefined);
});

test("网易云候选使用固定 Draft 公钥复验并拒绝内容、Manifest、签名和未知 key 篡改", async () => {
  const manifestPath = "examples/manifests/netease-music-media-controls.candidate.draft.json";
  const contentPath = "examples/profiles/netease-music-media-controls.candidate.draft.json";
  const [manifestBytes, contentBytes, catalogBytes] = await Promise.all([
    readFile(path.join(repositoryRoot, manifestPath)),
    readFile(path.join(repositoryRoot, contentPath)),
    readFile(path.join(repositoryRoot, "examples/catalog/catalog.draft.json"))
  ]);
  const manifest = JSON.parse(manifestBytes);
  const catalog = JSON.parse(catalogBytes);
  const catalogEntry = catalog.manifests.find((entry) => entry.manifestPath === manifestPath);

  const actualContentDigest = `sha256:${createHash("sha256").update(contentBytes).digest("hex")}`;
  assert.equal(actualContentDigest, manifest.contentDigest);
  assert.equal(catalogEntry?.manifestDigest, sha256CanonicalJson(manifest));
  assert.equal(await verifyWithDraftFixture(manifest), true);

  const tamperedContent = Buffer.from(contentBytes.toString("utf8").replace("playPause", "volumeUp"));
  assert.notEqual(
    `sha256:${createHash("sha256").update(tamperedContent).digest("hex")}`,
    manifest.contentDigest
  );

  const tamperedManifest = { ...manifest, version: "0.1.1" };
  assert.equal(await verifyWithDraftFixture(tamperedManifest), false);
  assert.notEqual(sha256CanonicalJson(tamperedManifest), catalogEntry?.manifestDigest);

  const firstSignatureCharacter = manifest.signature.value[0] === "A" ? "B" : "A";
  const tamperedSignature = {
    ...manifest,
    signature: {
      ...manifest.signature,
      value: `${firstSignatureCharacter}${manifest.signature.value.slice(1)}`
    }
  };
  assert.equal(await verifyWithDraftFixture(tamperedSignature), false);

  const unknownKey = {
    ...manifest,
    signature: { ...manifest.signature, keyID: "draft-unknown-fixture-key-01" }
  };
  assert.equal(await verifyWithDraftFixture(unknownKey), false);
});

test("撤销选择器采用 AND 语义并支持 package、key 与 digest", () => {
  const manifest = {
    ...baseManifest(),
    signature: { algorithm: "ed25519", keyID: "fixture-key-01", value: "A".repeat(86) + "==" }
  };

  assert.equal(
    isManifestRevoked(manifest, {
      revision: 1,
      entries: [{ packageID: manifest.packageID, version: manifest.version, reason: "maliciousContent" }]
    }),
    true
  );
  assert.equal(
    isManifestRevoked(manifest, {
      revision: 1,
      entries: [{ packageID: manifest.packageID, version: "0.2.0", reason: "maliciousContent" }]
    }),
    false
  );
  assert.equal(
    isManifestRevoked(manifest, {
      revision: 1,
      entries: [{ keyID: "fixture-key-01", reason: "keyCompromise" }]
    }),
    true
  );
  assert.equal(
    isManifestRevoked(manifest, {
      revision: 1,
      entries: [{ contentDigest: manifest.contentDigest, reason: "contentIntegrity" }]
    }),
    true
  );
  assert.equal(
    isManifestRevoked(manifest, { revision: 1, entries: [{ reason: "policyViolation" }] }),
    false
  );
});

test("Schema 严格拒绝未知字段、URL、绝对路径、脚本路径和无选择器撤销项", async () => {
  const validateManifest = await loadValidator("schemas/marketplace-manifest.schema.json");
  const validateCatalog = await loadValidator("schemas/marketplace-catalog.schema.json");
  const signature = { algorithm: "ed25519", keyID: "fixture-key-01", value: "A".repeat(86) + "==" };
  const manifest = { ...baseManifest(), signature };
  const catalog = {
    schemaVersion: "0.1-draft",
    status: "candidate",
    catalogVersion: 1,
    generatedAt: "2026-09-02T00:00:00Z",
    manifests: [
      {
        manifestPath: "examples/manifests/fixture.draft.json",
        manifestDigest: `sha256:${"2".repeat(64)}`
      }
    ],
    revocations: { revision: 0, entries: [] },
    signature
  };

  assert.equal(validateManifest(manifest), true);
  assert.equal(validateCatalog(catalog), true);
  assert.equal(validateManifest({ ...manifest, unexpected: true }), false);
  assert.equal(validateManifest({ ...manifest, contentPath: "https://invalid.example/payload.json" }), false);
  assert.equal(validateManifest({ ...manifest, contentPath: "/etc/passwd" }), false);
  assert.equal(validateManifest({ ...manifest, contentPath: "examples/macros/install.sh" }), false);
  assert.equal(
    validateCatalog({ ...catalog, manifests: [{ ...catalog.manifests[0], manifestPath: "../fixture.json" }] }),
    false
  );
  assert.equal(
    validateCatalog({
      ...catalog,
      revocations: { revision: 1, entries: [{ reason: "policyViolation" }] }
    }),
    false
  );
  assert.equal(validateCatalog({ ...catalog, generatedAt: "2026-02-31T00:00:00Z" }), false);
  assert.deepEqual(forbiddenContractPaths({ releaseNotes: "see https://invalid.example/payload" }), [
    "$.releaseNotes"
  ]);
  assert.deepEqual(forbiddenContractPaths({ releaseNotes: "run curl payload" }), ["$.releaseNotes"]);
  assert.deepEqual(forbiddenContractPaths({ releaseNotes: "read /etc/passwd" }), ["$.releaseNotes"]);
  assert.deepEqual(forbiddenContractPaths({ secretToken: "redacted" }), ["$.secretToken"]);
});

test("共享路径 fixture 与 Catalog、Manifest Schema 保持一致", async () => {
  const validateManifest = await loadValidator("schemas/marketplace-manifest.schema.json");
  const validateCatalog = await loadValidator("schemas/marketplace-catalog.schema.json");
  const cases = JSON.parse(
    await readFile(path.join(repositoryRoot, "tests/fixtures/marketplace-paths.json"), "utf8")
  );
  const signature = { algorithm: "ed25519", keyID: "fixture-key-01", value: "A".repeat(86) + "==" };

  for (const fixture of cases) {
    if (fixture.kind === "manifest") {
      const catalog = {
        schemaVersion: "0.1-draft",
        status: "candidate",
        catalogVersion: 1,
        generatedAt: "2026-09-02T00:00:00Z",
        manifests: [
          {
            manifestPath: fixture.path,
            manifestDigest: `sha256:${"2".repeat(64)}`
          }
        ],
        revocations: { revision: 0, entries: [] },
        signature
      };
      assert.equal(validateCatalog(catalog), fixture.valid, fixture.path);
    } else {
      assert.equal(
        validateManifest({ ...baseManifest(), contentPath: fixture.path, signature }),
        fixture.valid,
        fixture.path
      );
    }
  }
});
