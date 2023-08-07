# Add pbjs path
export "PATH=$PATH:/Users/huyuhua/Solutions/DarkEggProj/AgoraSpeech2TextDemo/AgoraSpeech2TextDemo/web/node_modules/protobufjs/cli/bin"
# gen javascript code
# pbjs -t static ./SttMessage.proto > ./SttMessage_pb.js
# pbjs -t static-module ./SttMessage.proto > ./SttMessage_pbm.js
pbjs -t json-module ./SttMessage.proto > ./SttMessage.js