import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";

// Instantiated once at module load; reused across warm Lambda invocations.
const client = new DynamoDBClient({});

function rateTableName() {
  return process.env.RATE_TABLE_NAME;
}

function cacheTableName() {
  return process.env.CACHE_TABLE_NAME;
}

export async function checkRateLimit(sourceIp, date) {
  const result = await client.send(
    new GetItemCommand({
      TableName: rateTableName(),
      Key: {
        sourceIp: { S: sourceIp },
        date: { S: date },
      },
    })
  );
  const count = result.Item?.count?.N;
  return count ? Number(count) : 0;
}

// Atomic increment via ADD; ttl is set only when the item is first created
// (if_not_exists keeps it stable across the day's subsequent increments).
export async function incrementRateLimit(sourceIp, date) {
  const ttl = Math.floor(Date.now() / 1000) + 48 * 60 * 60;
  await client.send(
    new UpdateItemCommand({
      TableName: rateTableName(),
      Key: {
        sourceIp: { S: sourceIp },
        date: { S: date },
      },
      UpdateExpression: "ADD #c :one SET #t = if_not_exists(#t, :ttl)",
      ExpressionAttributeNames: { "#c": "count", "#t": "ttl" },
      ExpressionAttributeValues: {
        ":one": { N: "1" },
        ":ttl": { N: String(ttl) },
      },
    })
  );
}

export async function checkCache(normalizedQuestion) {
  const result = await client.send(
    new GetItemCommand({
      TableName: cacheTableName(),
      Key: { normalizedQuestion: { S: normalizedQuestion } },
    })
  );
  return result.Item?.answer?.S ?? null;
}

export async function writeCache(normalizedQuestion, answer) {
  const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
  await client.send(
    new PutItemCommand({
      TableName: cacheTableName(),
      Item: {
        normalizedQuestion: { S: normalizedQuestion },
        answer: { S: answer },
        ttl: { N: String(ttl) },
      },
    })
  );
}
