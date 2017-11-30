module.exports = {
  syncPublicTasks: (event, admin) => {
    // Only edit data when it is edited.
    if (!event.data.previous.exists()) {
      return;
    }

    const eventSnapshot = event.data;

    //Sync only if displayName and photoURL changed
    if (
      !eventSnapshot.child('displayName').changed() &&
      !eventSnapshot.child('photoURL').changed()
    ) {
      return;
    }

    let tasksRef = admin.database().ref('/public_tasks');

    var query = tasksRef.orderByChild('userId').equalTo(event.params.userUid);

    const userName = eventSnapshot.child('displayName').val();
    const userPhotoURL = eventSnapshot.child('photoURL').val();

    return query.once('value').then(snapshot => {
      var updates = {};
      snapshot.forEach(childSnapshot => {
        //Update if user is edited and delete if user is deleted
        if (event.data.exists()) {
          updates[`/${childSnapshot.key}/userName`] = userName;
          updates[`/${childSnapshot.key}/userPhotoURL`] = userPhotoURL;
        } else {
          updates[`/${childSnapshot.key}`] = null;
        }
      });

      return tasksRef.update(updates, function(error) {
        if (error) {
          console.log('Error:', error);
        } else {
          console.log('Task synced with user successfully!');
        }
      });
    });
  },
  syncPublicChats: (event, admin) => {
    // Only edit data when it is edited.
    if (!event.data.previous.exists()) {
      return;
    }

    const eventSnapshot = event.data;

    //Sync only if displayName and photoURL changed
    if (
      !eventSnapshot.child('displayName').changed() &&
      !eventSnapshot.child('photoURL').changed()
    ) {
      return;
    }

    let tasksRef = admin.database().ref('/public_chats');

    var query = tasksRef.orderByChild('userId').equalTo(event.params.userUid);

    const userName = eventSnapshot.child('displayName').val();
    const userPhotoURL = eventSnapshot.child('photoURL').val();

    return query.once('value').then(snapshot => {
      var updates = {};
      snapshot.forEach(childSnapshot => {
        //Update if user is edited and delete if user is deleted
        if (event.data.exists()) {
          updates[`/${childSnapshot.key}/userName`] = userName;
          updates[`/${childSnapshot.key}/userPhotoURL`] = userPhotoURL;
        } else {
          updates[`/${childSnapshot.key}`] = null;
        }
      });

      return tasksRef.update(updates, function(error) {
        if (error) {
          console.log('Error:', error);
        } else {
          console.log('Public chat synced with user successfully!');
        }
      });
    });
  },
};
