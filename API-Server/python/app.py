from flask import Flask, request, jsonify, abort, make_response
from speechmatics.models import ConnectionSettings
from speechmatics.batch_client import BatchClient
from httpx import HTTPStatusError
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)

def after_request(resp):
    print("after request")
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

app.after_request(after_request)

API_URL = ""
API_KEY = ""
FILE_PATH = "./files/"
LANGUAGE = "auto"

# Setting 
settings = ConnectionSettings(
    url = API_URL,
    auth_token = API_KEY,
)
# Define transcription parameters
conf = {
    "type": "transcription",
    "transcription_config": {
        "language": LANGUAGE
    },
    # "fetch_data": {
    #     "url": "https://mpdown.kekenet.com/Sound/2017/01/abmgbyj23_3016209e7h.mp3"
    # },
    "notification_config": [{
        "url": "http://115.231.168.155:8012/jobcallback",
        "contents": ["transcript", "data"],
        # "auth_headers": ["Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhb"]
    }]
}

@app.route("/")
def home():
    return "Welcome to STT offline transcription API server."

# Upload file
@app.route('/upload', methods=['POST'])
def uploadFile() :
    if 'file' not in request.files:
        # no file part
        res = make_response(jsonify({"errorCode": 1, "message": "No file in request."}), 400) # bad reequest
        return res
    file = request.files['file']
    if file.filename == '':
        res = make_response(jsonify({"errorCode": 1, "message": "The file is empty."}), 400) # bad reequest
    if file:
        fileName = secure_filename(file.filename)
        file.save(os.path.join(FILE_PATH, fileName))
        res = make_response(jsonify({"errorCode": 0, "message": "Upload file success.", "fileUrl": fileName}), 200)
        return res
    # unkown error
    res = make_response(jsonify({"errorCode": 999, "message": "Unknown error."}), 500)
    return res

# 
@app.route('/start', methods=['POST'])
def startWithFile():
    json = request.json
    if 'fileName' not in json:
        # no file part
        res = make_response(jsonify({"errorCode": 1, "message": "No file name field in request."}), 400) # bad reequest
        return res
    fileName = json['fileName']
    if fileName is None or  fileName == '' :
        res = make_response(jsonify({"errorCode": 2, "message": "No file name value in request."}), 400)
        return res
    filePath = os.path.join(FILE_PATH, fileName)
    if not (os.path.isfile(filePath)) :
        res = make_response(jsonify({"errorCode": 3, "message": "File not found."}), 404)
        return res
    fd = os.open(filePath, os.O_RDONLY)
    file = os.read(fd, os.fstat(fd).st_size)
    if file is None:
        res = make_response(jsonify({"errorCode": 4, "message": "File not found."}), 404)
        return res
    #
    try:
        print("ddd")
        (jobId, transcript) = createJob(file, conf)
        res = make_response(jsonify({"errorCode": 200, "message": "Create job success.", "jobId": jobId, "transcript": transcript}), 200)
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Methods'] = 'OPTIONS,HEAD,GET,POST'
        res.headers['Access-Control-Allow-Headers'] = 'x-requested-with'
        return res
    except HTTPStatusError as e:
        res = jsonify({"errorCode": 501, "message": "Create job failed."})
        raise e
    res = make_response(jsonify({"errorCode": 0, "message": "Unknown error."}), 200)
    return res

# Create job
@app.route('/jobs', methods=['POST'])
def createJobApiHandler() :
    # print('create job')
    # print(request.form)
    # print(request.files['data_file'])
    # print(request.form.get('data_file'))
    data_file = request.files['data_file'].read()
    config = conf # request.form['config']
    # print(data_file)
    # print(config)
    try:
        (jobId, transcript) = createJob(data_file, config)
        res = make_response(jsonify({"errorCode": 200, "message": "Create job success.", "jobId": jobId, "transcript": transcript}), 200)
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Methods'] = 'OPTIONS,HEAD,GET,POST'
        res.headers['Access-Control-Allow-Headers'] = 'x-requested-with'
        return res
    except HTTPStatusError as e:
        res = jsonify({"errorCode": 501, "message": "Create job failed."})
        raise e
    return res

# Get job list
@app.route('/jobs', methods=['GET'])
def getJobListApiHandler() :
    return "Get job list API"

# Get job info
@app.route('/jobs/<string:jobId>', methods=['GET'])
def getJobInfoApiHandler(jobId) :
    if jobId is None : 
        return jsonify({"errorCode": 502, "message": "The jobId is necessary."}) 
    print(jobId)
    return "Get job info API of " + jobId

@app.route('/jobcallback', methods=['POST'])
def getJobNotificationHandler() :
    json = request.json
    result = request.args.get("status")
    print(result)
    print(result)
    if result == 'success' :
        return jsonify({"errorCode": 501, "message": "Create job failed."})
    return "done"

# create job config
def createJobConfig(fetchData) : 
    return ""

# create transcription Job
def createJob(dataFile, config):
    # print(dataFile)
    # Open the client using a context manager
    with BatchClient(settings) as client:
        try:
            # print(dataFile)
            job_id = client.submit_job(
                audio = ("dataFile.mp3", dataFile),
                transcription_config = config,
            )
            # print("job dd")
            print(f'job {job_id} submitted successfully, waiting for transcript')

            # Note that in production, you should set up notifications instead of polling.
            # Notifications are described here: https://docs.speechmatics.com/features-other/notifications
            transcript = client.wait_for_completion(job_id, transcription_format='txt')
            # To see the full output, try setting transcription_format='json-v2'.
            print(transcript)

            return (job_id, transcript)
        except HTTPStatusError as e:
            if e.response.status_code == 401:
                print('Invalid API key - Check your API_KEY at the top of the code!')
            elif e.response.status_code == 400:
                print(e.response.json()['detail'])
            else:
                raise e
# make response
def makeResponseBody(code, message, httpStatus):
    return 0

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=80)

# EOF
