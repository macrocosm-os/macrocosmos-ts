// Generated from gravity/v1/gravity.proto

// TypeScript interfaces generated from protobuf definitions
export interface ICrawler {
  crawlerId?: string;
  criteria?: ICrawlerCriteria;
  startTime?: Date;
  deregistrationTime?: Date;
  archiveTime?: Date;
  state?: ICrawlerState;
  datasetWorkflows?: string[];
}

export interface ICrawlerCriteria {
  platform?: string;
  topic?: string;
  notification?: ICrawlerNotification;
  mock?: boolean;
}

export interface ICrawlerNotification {
  to?: string;
  link?: string;
}

export interface IHfRepo {
  repoName?: string;
  rowCount?: number;
  lastUpdate?: Date;
}

export interface ICrawlerState {
  status?: string;
  bytesCollected?: number;
  recordsCollected?: number;
  repos?: IHfRepo[];
}

export interface IGravityTaskState {
  gravityTaskId?: string;
  name?: string;
  status?: string;
  startTime?: Date;
  crawlerIds?: string[];
  crawlerWorkflows?: ICrawler[];
}

export interface IGetGravityTasksRequest {
  gravityTaskId?: string;
  includeCrawlers?: boolean;
}

export interface IGetGravityTasksResponse {
  gravityTaskStates?: IGravityTaskState[];
}

export interface IGravityTask {
  topic?: string;
  platform?: string;
}

export interface INotificationRequest {
  type?: string;
  address?: string;
  redirectUrl?: string;
}

export interface IGetCrawlerRequest {
  crawlerId?: string;
}

export interface IGetCrawlerResponse {
  crawler?: ICrawler;
}

export interface ICreateGravityTaskRequest {
  gravityTasks?: IGravityTask[];
  name?: string;
  notificationRequests?: INotificationRequest[];
  gravityTaskId?: string;
}

export interface ICreateGravityTaskResponse {
  gravityTaskId?: string;
}

export interface IBuildDatasetRequest {
  crawlerId?: string;
  notificationRequests?: INotificationRequest[];
}

export interface IBuildDatasetResponse {
  datasetId?: string;
  dataset?: IDataset;
}

export interface IDataset {
  crawlerWorkflowId?: string;
  createDate?: Date;
  expireDate?: Date;
  files?: IDatasetFile[];
  status?: string;
  statusMessage?: string;
  steps?: IDatasetStep[];
  totalSteps?: number;
}

export interface IDatasetFile {
  fileName?: string;
  fileSizeBytes?: number;
  lastModified?: Date;
  numRows?: number;
  s3Key?: string;
  url?: string;
}

export interface IDatasetStep {
  progress?: number;
  step?: number;
  stepName?: string;
}

export interface IGetDatasetRequest {
  datasetId?: string;
}

export interface IGetDatasetResponse {
  dataset?: IDataset;
}

export interface ICancelGravityTaskRequest {
  gravityTaskId?: string;
}

export interface ICancelGravityTaskResponse {
  message?: string;
}

export interface ICancelDatasetRequest {
  datasetId?: string;
}

export interface ICancelDatasetResponse {
  message?: string;
}


export interface IGravityServiceClient {
  GetGravityTasks(request: IGetGravityTasksRequest): Promise<IGetGravityTasksResponse>;
  GetCrawler(request: IGetCrawlerRequest): Promise<IGetCrawlerResponse>;
  CreateGravityTask(request: ICreateGravityTaskRequest): Promise<ICreateGravityTaskResponse>;
  BuildDataset(request: IBuildDatasetRequest): Promise<IBuildDatasetResponse>;
  GetDataset(request: IGetDatasetRequest): Promise<IGetDatasetResponse>;
  CancelGravityTask(request: ICancelGravityTaskRequest): Promise<ICancelGravityTaskResponse>;
  CancelDataset(request: ICancelDatasetRequest): Promise<ICancelDatasetResponse>;
}

// Original protobuf JSON schema
export const gravity = {
  "options": {
    "syntax": "proto3"
  },
  "nested": {
    "gravity": {
      "nested": {
        "v1": {
          "options": {
            "go_package": "macrocosm-os/rift/constellation_api/gen/gravity/v1"
          },
          "nested": {
            "GravityService": {
              "methods": {
                "GetGravityTasks": {
                  "requestType": "GetGravityTasksRequest",
                  "responseType": "GetGravityTasksResponse"
                },
                "GetCrawler": {
                  "requestType": "GetCrawlerRequest",
                  "responseType": "GetCrawlerResponse"
                },
                "CreateGravityTask": {
                  "requestType": "CreateGravityTaskRequest",
                  "responseType": "CreateGravityTaskResponse"
                },
                "BuildDataset": {
                  "requestType": "BuildDatasetRequest",
                  "responseType": "BuildDatasetResponse"
                },
                "GetDataset": {
                  "requestType": "GetDatasetRequest",
                  "responseType": "GetDatasetResponse"
                },
                "CancelGravityTask": {
                  "requestType": "CancelGravityTaskRequest",
                  "responseType": "CancelGravityTaskResponse"
                },
                "CancelDataset": {
                  "requestType": "CancelDatasetRequest",
                  "responseType": "CancelDatasetResponse"
                }
              }
            },
            "Crawler": {
              "fields": {
                "crawlerId": {
                  "type": "string",
                  "id": 1
                },
                "criteria": {
                  "type": "CrawlerCriteria",
                  "id": 2
                },
                "startTime": {
                  "type": "google.protobuf.Timestamp",
                  "id": 3
                },
                "deregistrationTime": {
                  "type": "google.protobuf.Timestamp",
                  "id": 4
                },
                "archiveTime": {
                  "type": "google.protobuf.Timestamp",
                  "id": 5
                },
                "state": {
                  "type": "CrawlerState",
                  "id": 6
                },
                "datasetWorkflows": {
                  "rule": "repeated",
                  "type": "string",
                  "id": 7
                }
              }
            },
            "CrawlerCriteria": {
              "fields": {
                "platform": {
                  "type": "string",
                  "id": 1
                },
                "topic": {
                  "type": "string",
                  "id": 2
                },
                "notification": {
                  "type": "CrawlerNotification",
                  "id": 3
                },
                "mock": {
                  "type": "bool",
                  "id": 4
                }
              }
            },
            "CrawlerNotification": {
              "fields": {
                "to": {
                  "type": "string",
                  "id": 1
                },
                "link": {
                  "type": "string",
                  "id": 2
                }
              }
            },
            "HfRepo": {
              "fields": {
                "repoName": {
                  "type": "string",
                  "id": 1
                },
                "rowCount": {
                  "type": "uint64",
                  "id": 2
                },
                "lastUpdate": {
                  "type": "string",
                  "id": 3
                }
              }
            },
            "CrawlerState": {
              "fields": {
                "status": {
                  "type": "string",
                  "id": 1
                },
                "bytesCollected": {
                  "type": "uint64",
                  "id": 2
                },
                "recordsCollected": {
                  "type": "uint64",
                  "id": 3
                },
                "repos": {
                  "rule": "repeated",
                  "type": "HfRepo",
                  "id": 4
                }
              }
            },
            "GravityTaskState": {
              "fields": {
                "gravityTaskId": {
                  "type": "string",
                  "id": 1
                },
                "name": {
                  "type": "string",
                  "id": 2
                },
                "status": {
                  "type": "string",
                  "id": 3
                },
                "startTime": {
                  "type": "google.protobuf.Timestamp",
                  "id": 4
                },
                "crawlerIds": {
                  "rule": "repeated",
                  "type": "string",
                  "id": 5
                },
                "crawlerWorkflows": {
                  "rule": "repeated",
                  "type": "Crawler",
                  "id": 6
                }
              }
            },
            "GetGravityTasksRequest": {
              "fields": {
                "gravityTaskId": {
                  "type": "string",
                  "id": 1
                },
                "includeCrawlers": {
                  "type": "bool",
                  "id": 2
                }
              }
            },
            "GetGravityTasksResponse": {
              "fields": {
                "gravityTaskStates": {
                  "rule": "repeated",
                  "type": "GravityTaskState",
                  "id": 1
                }
              }
            },
            "GravityTask": {
              "fields": {
                "topic": {
                  "type": "string",
                  "id": 1
                },
                "platform": {
                  "type": "string",
                  "id": 2
                }
              }
            },
            "NotificationRequest": {
              "fields": {
                "type": {
                  "type": "string",
                  "id": 1
                },
                "address": {
                  "type": "string",
                  "id": 2
                },
                "redirectUrl": {
                  "type": "string",
                  "id": 3
                }
              }
            },
            "GetCrawlerRequest": {
              "fields": {
                "crawlerId": {
                  "type": "string",
                  "id": 1
                }
              }
            },
            "GetCrawlerResponse": {
              "fields": {
                "crawler": {
                  "type": "Crawler",
                  "id": 1
                }
              }
            },
            "CreateGravityTaskRequest": {
              "fields": {
                "gravityTasks": {
                  "rule": "repeated",
                  "type": "GravityTask",
                  "id": 1
                },
                "name": {
                  "type": "string",
                  "id": 2
                },
                "notificationRequests": {
                  "rule": "repeated",
                  "type": "NotificationRequest",
                  "id": 3
                },
                "gravityTaskId": {
                  "type": "string",
                  "id": 4
                }
              }
            },
            "CreateGravityTaskResponse": {
              "fields": {
                "gravityTaskId": {
                  "type": "string",
                  "id": 1
                }
              }
            },
            "BuildDatasetRequest": {
              "fields": {
                "crawlerId": {
                  "type": "string",
                  "id": 1
                },
                "notificationRequests": {
                  "rule": "repeated",
                  "type": "NotificationRequest",
                  "id": 2
                }
              }
            },
            "BuildDatasetResponse": {
              "fields": {
                "datasetId": {
                  "type": "string",
                  "id": 1
                },
                "dataset": {
                  "type": "Dataset",
                  "id": 2
                }
              }
            },
            "Dataset": {
              "fields": {
                "crawlerWorkflowId": {
                  "type": "string",
                  "id": 1
                },
                "createDate": {
                  "type": "google.protobuf.Timestamp",
                  "id": 2
                },
                "expireDate": {
                  "type": "google.protobuf.Timestamp",
                  "id": 3
                },
                "files": {
                  "rule": "repeated",
                  "type": "DatasetFile",
                  "id": 4
                },
                "status": {
                  "type": "string",
                  "id": 5
                },
                "statusMessage": {
                  "type": "string",
                  "id": 6
                },
                "steps": {
                  "rule": "repeated",
                  "type": "DatasetStep",
                  "id": 7
                },
                "totalSteps": {
                  "type": "int64",
                  "id": 8
                }
              }
            },
            "DatasetFile": {
              "fields": {
                "fileName": {
                  "type": "string",
                  "id": 1
                },
                "fileSizeBytes": {
                  "type": "uint64",
                  "id": 2
                },
                "lastModified": {
                  "type": "google.protobuf.Timestamp",
                  "id": 3
                },
                "numRows": {
                  "type": "uint64",
                  "id": 4
                },
                "s3Key": {
                  "type": "string",
                  "id": 5
                },
                "url": {
                  "type": "string",
                  "id": 6
                }
              }
            },
            "DatasetStep": {
              "fields": {
                "progress": {
                  "type": "double",
                  "id": 1
                },
                "step": {
                  "type": "int64",
                  "id": 2
                },
                "stepName": {
                  "type": "string",
                  "id": 3
                }
              }
            },
            "GetDatasetRequest": {
              "fields": {
                "datasetId": {
                  "type": "string",
                  "id": 1
                }
              }
            },
            "GetDatasetResponse": {
              "fields": {
                "dataset": {
                  "type": "Dataset",
                  "id": 1
                }
              }
            },
            "CancelGravityTaskRequest": {
              "fields": {
                "gravityTaskId": {
                  "type": "string",
                  "id": 1
                }
              }
            },
            "CancelGravityTaskResponse": {
              "fields": {
                "message": {
                  "type": "string",
                  "id": 1
                }
              }
            },
            "CancelDatasetRequest": {
              "fields": {
                "datasetId": {
                  "type": "string",
                  "id": 1
                }
              }
            },
            "CancelDatasetResponse": {
              "fields": {
                "message": {
                  "type": "string",
                  "id": 1
                }
              }
            }
          }
        }
      }
    },
    "google": {
      "nested": {
        "protobuf": {
          "nested": {
            "Timestamp": {
              "fields": {
                "seconds": {
                  "type": "int64",
                  "id": 1
                },
                "nanos": {
                  "type": "int32",
                  "id": 2
                }
              }
            }
          }
        }
      }
    }
  }
};
