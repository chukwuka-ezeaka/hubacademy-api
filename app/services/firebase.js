const admin = require('firebase-admin');
const serviceAccount = require("../../fcm/push-note-265210-firebase-adminsdk-tedbr-2e4127d5c4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://push-note-265210.firebaseio.com"
});


const send_notification = async (id,notificationKey,type) => {
  return new Promise(async (resolve, reject) => {
    var payload = {
          'data': {
              'data': JSON.stringify({
              id:id
              }),
              'type':type,
          },
      };
      var options = { 
          'priority': "high",
      };
      console.log('token: ' + notificationKey)
      admin.messaging().sendToDevice(notificationKey, payload,options)
      .then(function(response) {
          console.log('Successfully sent message:', response);
          resolve(true);
      })
      .catch(function(error) {
          console.log('Error sending message:', error);
          reject(error)
      });
  });
}

const call_notification = async (data) => {
  return new Promise(async (resolve, reject) => {
      const caller = {
          id: data.user.id,
          realName: data.user.name,
          photo: data.user.photo
      }
      var payload = {
            'data': {
                'data': JSON.stringify(caller),
                'type':'voice_call',
            },
        };
        var options = { 
            'priority': "high",
        };
        admin.messaging().sendToDevice(data.fcmTokenMobile, payload,options)
        .then(function(response) {
            console.log('Successfully sent message:', response);
            resolve(true);
        })
        .catch(function(error) {
            console.log('Error sending message:', error);
            reject(error)
        });
  });

}


const video_call_notification = async (data) => {
  return new Promise(async (resolve, reject) => {
      const caller = {
          id: data.user.id,
          realName: data.user.name,
          photo: data.user.photo
      }
      var payload = {
            'data': {
                'data': JSON.stringify(caller),
                'type':'videocall',
            },
        };
        var options = { 
            'priority': "high",
        };
        admin.messaging().sendToDevice(data.fcmTokenMobile, payload,options)
        .then(function(response) {
            console.log('Successfully sent message:', response);
            resolve(true);
        })
        .catch(function(error) {
            console.log('Error sending message:', error);
            reject(error)
        });
  });

}









const notify = {
  send_notification,
  call_notification,
  video_call_notification
}

module.exports = notify

