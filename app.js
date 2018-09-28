// fake REST API created using json-server

// to run project do npm install
// to run server do npm run json-server

// get single user: users/id

// additional:

// show more button
// search by firts letter of name / last name
// search

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


const Model = (() => {

    const endpoint = "http://localhost:3000/users/";
    let group;



    // store all the data after first fetch and use it form there on, or make a new request every time
    // data on friends is needed??

    const _parseFriends = (friendsIds) => {
        // helper function used by fetchFriends function
        // takses array of user's friend's ids; returns coresonding array of user's friends objects

        // just fetch friends directly??

        const friends = [];
        friendsIds.forEach((friendId) => {
            group.forEach((member) => {
                if (friendId === member.id) {
                    friends.push(member);
                }
            })
        });
        return friends;
    }

    // this can be done without network request - just useing data stored
    // the version using network request is more scalable 
    const fetchFriends = (userId) => {
        // receives user id
        // returns (a promise that resolves to) array of friends objects 
        return fetch(endpoint + userId)
            .then(response => response.json())
            .then(data => data.friends)
            .then(friends => _parseFriends(friends));
        // refactor it to just return freinds' ids, not friends' objects?
    }

    const getFriendsOfFriends = (userId) => {
        // takes userId; returns array of friends of friends
        // (those who are two steps away from the user but not directly connected to him)
        const ownFriends = [];
        return fetchFriends(userId)
            .then(friends => {
                const friendsOfFriends = [];
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
                return friendsOfFriends;
            })
    }


    // getFriendsOfFriends(2)
    //     .then(data => console.log(data));

    const getSuggestedFriends = (userId) => {
        const suggestedFriends = [];
        // get user friends ids from his object:
        const user = group.find((member) => {
            return member.id === userId;
        });
        const usersFriends = user.friends;

        group.forEach((member) => {
            // if group member is not directly connected to the user, and its is not user himself
            if (!usersFriends.includes(member.id) && userId !== member.id) {
                // and he / she knows 2 or more direct friends of the user
                let countCommonFriends = 0;
                usersFriends.forEach((usersFriend) => {
                    if (member.friends.includes(usersFriend)) {
                        countCommonFriends++;
                    }
                })
                // add him / her to suggested friends array
                if (countCommonFriends > 1) {
                    suggestedFriends.push(member);
                }
            }
        });
        return suggestedFriends;
    }

    fetchData = (callback) => {
        fetch(endpoint)
        .then(response => response.json())
        .then(data => group = data)
        .then(() => {
            callback(group);
            // run it inside fetch for testing purposes only:
            getSuggestedFriends(7);
        });
    }
  

    return {
        group, 
        fetchData
    }

})();

// VIEW

const View = (() => {

    const createUser = (user) => {
        const usersElement = document.getElementsByClassName("users")[0];
        const singleUserElement = document.createElement("div");
        singleUserElement.classList.add("user");
        singleUserElement.setAttribute("id", user.id);
        const userNameElement = document.createElement("p");
        const userAgeElement = document.createElement("p");
        const userGenderElement = document.createElement("p");
        userNameElement.innerHTML = `${user.firstName} ${user.surname}` || "(not provided)";
        userAgeElement.innerHTML = user.age  || "(not provided)";
        userGenderElement.innerHTML = user.gender  || "(not provided)";
        singleUserElement.appendChild(userNameElement);
        singleUserElement.appendChild(userAgeElement);
        singleUserElement.appendChild(userGenderElement);
        usersElement.appendChild(singleUserElement);
    }

    const displayUsers = (users) => {
        users.forEach((user) => {
            createUser(user);
        })
    }


    const displayRelatedContacts = (contacts) => {
        // see how to create a modal or display contast on the side
        // pass this method (somehow) whether it is friends, or fs of fs, or suggestions that it
        // is displaying
    }

    return {
        displayUsers
    }

})();



// CONTROLLER

const Controller = ((Model, View) => {

    const displayContactsBtns = document.getElementsByClassName("display-contacts-btn");

    Array.from(displayContactsBtns).forEach((btn) => {
        btn.addEventListener("click", (e) => View.displayRelatedContacts(e));
    });

    Model.fetchData(View.displayUsers);



})(Model, View);







