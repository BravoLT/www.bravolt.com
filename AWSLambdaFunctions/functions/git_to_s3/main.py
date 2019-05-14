###
# Company: BravoLT
# Date: May, 14th, 2019
# Author: Ryan Wise https://github.com/leobeosab
###

from urllib.request import urlopen
import json
import zipfile
import boto3
import io
import time
import mimetypes

def getFileFromGit():
    return urlopen("https://github.com/BravoLT/www.bravolt.com/archive/master.zip").read()

def invalidateAllCFFiles(fileList):
    distID = "E24ZOIJF79BO2Z"

    cloudFrontConn = boto3.client('cloudfront')
    cloudFrontConn.create_invalidation(
        DistributionId=distID, 
        InvalidationBatch={
            'Paths': {
                'Quantity': len(fileList),
                'Items': fileList
            },
            'CallerReference': 'Lambda:'+ str(time.time())
        })

def uploadZipToS3():
    s3Target = 'www.bravolt.com' #bucket name
    buildFolder = '/public/' #build subdir

    s3 = boto3.client('s3')
    
    putObjects = []
    fileList = []
    with io.BytesIO(getFileFromGit()) as tf:
        tf.seek(0)
        with zipfile.ZipFile(tf, mode='r') as zipf:
            for file in zipf.infolist():
                filePath = file.filename
                filePath = filePath.split(buildFolder)
                if len(filePath) != 2 or len(filePath[1]) == 0 or filePath[1].endswith('/'): 
                    #We only want the _site/* files with no path before it
                    continue

                fileName = filePath[1]

                #Guess the mime type
                mimetype, _ = mimetypes.guess_type(fileName)
                if mimetype is None:
                    mimetype = 'binary/octet-stream'

                putFile = s3.put_object(Bucket=s3Target, Key=fileName, Body=zipf.read(file), ACL='public-read', ContentType=mimetype)

                fileList.append('/' + fileName)
                putObjects.append(putFile)
                print(fileName)

    if len(putObjects) > 0:
        invalidateAllCFFiles(fileList)
        return "Success!"
    else:
        return "Error"

def handle(event, context):

    body = ""
    statusCode = 200

    try:
       body = uploadZipToS3() 
    except Exception as e:
        statusCode = 500
        body = "\n" + str(e)

    return {
        'statusCode': statusCode,
        'body': json.dumps(body)
    }

uploadZipToS3()