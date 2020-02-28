require("console-stamp")(console);

const drive = require("drive-db");
const AWS = require("aws-sdk");

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(name + " env var is required");
  }
  return value;
}

/// AWS https://covid19japan.s3-ap-northeast-1.amazonaws.com/data.json

const ID = getEnv("AWS_S3_ID");
const SECRET = getEnv("AWS_S3_SECRET");

const FILENAME = getEnv("S3_FILENAME");
const BUCKET_NAME = getEnv("AWS_S3_BUCKET_NAME");
const BUCKET_LOCATION = getEnv("AWS_S3_BUCKET_LOCATION");
const ALLOWED_ORIGINS = getEnv("AWS_S3_BUCKET_ALLOWED_ORIGINS").split(",");

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});

async function createBucket() {
  return new Promise((resolve, reject) => {
    s3.createBucket(
      {
        Bucket: BUCKET_NAME,
        CreateBucketConfiguration: {
          LocationConstraint: BUCKET_LOCATION
        }
      },
      function(err, data) {
        if (err && err.code !== "BucketAlreadyOwnedByYou") {
          reject(err);
          return;
        }

        s3.putBucketCors(
          {
            Bucket: BUCKET_NAME,
            CORSConfiguration: {
              CORSRules: [
                {
                  AllowedMethods: ["GET"],
                  AllowedOrigins: ALLOWED_ORIGINS,
                  AllowedHeaders: ["*"],
                  ExposeHeaders: [],
                  MaxAgeSeconds: 60 * 60 * 24
                }
              ]
            }
          },
          function(err, data) {
            if (err) {
              reject(err);
              return;
            }

            resolve(data);
          }
        );
      }
    );
  });
}

async function uploadPublicJSONToS3(filename, content) {
  return new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: content,
        ACL: "public-read",
        CacheControl: "public, max-age=120",
        ContentType: "application/json",
        ContentDisposition: "inline"
      },
      function(err, data) {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      }
    );
  });
}
/// / AWS

const SHEET = "1jfB4muWkzKTR0daklmf8D5F0Uf_IYAgcx_-Ij9McClQ";
const SHEET_PREFECTURES_TAB = 2;
const SHEET_DAILY_SUM_TAB = 3;
const SHEET_LAST_UPDATED_TAB = 4;

const tabs = {
  prefectures: SHEET_PREFECTURES_TAB,
  daily: SHEET_DAILY_SUM_TAB,
  updated: SHEET_LAST_UPDATED_TAB
};

async function fetchData() {
  const data = await Promise.all(
    Object.keys(tabs).map(async tab => {
      return {
        [tab]: await drive({ sheet: SHEET, tab: tabs[tab] })
      };
    })
  );

  let mergedData = {};

  data.forEach(obj => {
    mergedData = { ...mergedData, ...obj };
  });

  return mergedData;
}

async function uploadData(data) {
  const fileContent = JSON.stringify(data);
  return await uploadPublicJSONToS3(FILENAME, fileContent);
}

async function task() {
  console.log("Fetching data...");
  const data = await fetchData();
  console.log("Uploading data...");
  await uploadData(data);
  console.log("Ok!");
}


async function setup() {
  console.log("Creating bucket...");
  await createBucket();
}

exports.setup = setup;
exports.task = task;
