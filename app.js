// fake REST API created using json-server
// to run server do npm run json-server

// get single user: users/id

// functionality to choose a person within the group stored in the database 
// and display the following information about this person:

// • Direct friends: those people who are directly connected to the chosen user;
// • Friends of friends: those who are two steps away from the user but not directly connected to him;
// • Suggested friends: people in the group who know 2 or more direct friends of the user
//  but are not directly connected to him;

// Example user:
// {
//     "id": 1,
//     "firstName": "Paul",
//     "surname": "Crowe",
//     "age": 28,
//     "gender": "male",
//     "friends": [
//       2
//     ]
//   }


const endpoint = "http://localhost:3000/users/";
let allUsers;

fetch(endpoint)
    .then(response => response.json())
    .then(data => allUsers = data)

// store all the data after first fetch and use it form there on, or make a new request every time
// data on friends is needed??

const _parseFriends = (friendsIds) => {
    // helper function used by fetchFriends function
    // takses array of user's friend's ids; returns coresonding array of user's friends objects
    const friends = [];
    friendsIds.forEach((friendId) => {
        allUsers.forEach((user) => {
            if (friendId === user.id) {
                friends.push(user);
            }
        })
    });
    return friends;
}

// this can be done without network request - just use data stored
const fetchFriends = (userId) => {
    // receives user id
    // returns (a promise that resolves to) array of friends objects 
    return fetch(endpoint + userId)
        .then(response => response.json())
        .then(data => data.friends)
        .then(friends => _parseFriends(friends));
        // refactor it to just return freinds' ids, not friends' objects?
}

// if the above funcion is refactored:
// const fetchFriendsIds = (userId) => {
//     return fetch(endpoint + userId)
//         .then(response => response.json())
//         .then(data => data.friends)
// }


// get the return value of a function contatining fetch using then:
// fetchFriends(3).then((data => console.log(data)));

const getFriendsOfFriends = (userId) => {
    // takes userId; returns array of friends of friends
    // (those who are two steps away from the user but not directly connected to him)
    const friendsOfFriends = [];
    const ownFriends = [];
    fetchFriends(userId)
        .then(friends => {
            friends.forEach(friend => {
                ownFriends.push(friend);
                fetchFriends(friend.id)
                    .then((friends) => {
                        friends.forEach((friend) => {
                            if (friend.id !== userId && !ownFriends.includes(friend)) {
                                friendsOfFriends.push(friend);
                            }
                        })
                    })
            })
        })
        console.log(friendsOfFriends);
        return friendsOfFriends;
}

getFriendsOfFriends(2);


// VIEW

const displayUsers = (users) => {
    // display all users as boxes
}

const displayRelatedContacts = (contacts) => {
    // see how to create a modal or display contast on the side
    // pass this method (somehow) whether it is friends or f of f or suggestions that it
    // is displaying
}



// CONTROLLER

// const displayContactsBtns = document.getElementsByClassName("display-contacts-btn");
// displayContactsBtns.forEach((btn) => {
//     btn.addEventListener("click", (e) => View.displayRelatedContacts(e));
// });

// window.onload(displayUsers);

