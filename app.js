// fake REST API created using json-server

// to run project do npm install
// to run server do npm run json-server

// get single user: users/id

// additional:

// click on related contact to dsiplay additional information on the contact
// "show more" button
// search by first letter or name / last name
// search

const Model = (() => {

    const endpoint = "http://localhost:3000/users/";
    let group;

    fetchUsers = (displayUsers) => {
        fetch(endpoint)
            .then(response => response.json())
            .then(data => group = data)
            .then(() => {
                displayUsers(group);
            });
    }

    const _parseFriends = (friendsIds) => {
        // helper function used by fetchFriends function
        // takses array of user's friend's ids; returns coresonding array of user's friends' objects
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

    const fetchFriends = (userId, displayContacts) => {
        // receives user id
        // returns (a promise that resolves to) array of friends objects 
        return fetch(endpoint + userId)
            .then(response => response.json())
            .then(data => data.friends)
            .then(friends => _parseFriends(friends))
            .then(parsedFriends => {
                if(displayContacts) {
                    displayContacts(parsedFriends)
                }
                return parsedFriends;
            });
    }

    const getFriendsOfFriends = (userId) => {
        // takes userId; returns array of friends of friends
        const friendsOfFriends = [];
        const ownFriends = [];
        fetchFriends(userId)
            .then(friends => {
                friends.forEach(friend => {
                    ownFriends.push(friend);
                    fetchFriends(friend.id)
                        .then((friends) => {
                            friends.forEach((friend) => {
                                if (friend.id != userId && !ownFriends.includes(friend)) {
                                    friendsOfFriends.push(friend);
                                }
                            })
                        })
                })
            })
        return friendsOfFriends;
    }

    const getSuggestedFriends = (userId) => {
        const suggestedFriends = [];
        // get user friends' ids from his object:
        const user = group.find((member) => {
            return member.id == userId;
        });
        const usersFriends = user.friends;

        group.forEach((member) => {
            // if group member is not directly connected to the user, and it is not the user himself
            if (!usersFriends.includes(member.id) && userId != member.id) {
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

    return {
        group,
        fetchUsers,
        fetchFriends,
        getFriendsOfFriends,
        getSuggestedFriends
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
        userNameElement.innerHTML = `<span class="name-identifyer">Name:</span> ${user.firstName} ${user.surname}` || "(not provided)";
        userAgeElement.innerHTML = `Age: ${user.age}` || "(not provided)";
        userGenderElement.innerHTML = `<span class="gender-identifyer">Gender:</span> ${user.gender}` || "(not provided)";
        singleUserElement.appendChild(userNameElement);
        singleUserElement.appendChild(userAgeElement);
        singleUserElement.appendChild(userGenderElement);
        usersElement.appendChild(singleUserElement);
    }

    const createContact = (contact) => {
        const relatedContactsElement = document.getElementsByClassName("related-contacts")[0];
        const singleContatcElement = document.createElement("div");
        singleContatcElement.classList.add("contact");
        const contactNameElement = document.createElement("p");
        contactNameElement.innerHTML = `${contact.firstName} ${contact.surname}` || "(not provided)";
        singleContatcElement.appendChild(contactNameElement);
        relatedContactsElement.appendChild(singleContatcElement);
    }

    const displayUsers = (users) => {
        users.forEach((user) => {
            createUser(user);
        })
    }

    const displayRelatedContacts = (contacts) => {
        const relatedContactsElement = document.getElementsByClassName("related-contacts")[0];

        while (relatedContactsElement.firstChild) {
            relatedContactsElement.removeChild(relatedContactsElement.firstChild);
        }

        if(contacts && contacts.length > 0) {
            contacts.forEach((contact) => {
                createContact(contact);
            });
        } else {
            relatedContactsElement.innerHTML = "no contacts to display"
        }
    }

    const identifySelectedUser = (userId) => {
        const allUserElements = document.getElementsByClassName("user");
        const clickedUserElement = document.getElementById(userId);
        const friendsBtn = document.getElementsByClassName("friends-btn")[0];

        Array.from(allUserElements).forEach((element) => {
            element.classList.remove("selected");
        })
        clickedUserElement.classList.add("selected");

        friendsBtn.id = userId;
    }

    const markSelectedButton = (e) => {
    
        const allButtons = document.getElementsByClassName("buttons-container")[0].children;
        Array.from(allButtons).forEach((button) => {
            button.classList.remove("selected");
        })
        if(e){
            const lastClickedButton = e.target;
            lastClickedButton.classList.add("selected");
        } else {
            const friendsBtn = document.getElementsByClassName("friends-btn")[0];
            friendsBtn.classList.add("selected");
        }
    }

    return {
        displayUsers,
        displayRelatedContacts,
        identifySelectedUser,
        markSelectedButton
    }

})();

// CONTROLLER

const Controller = ((Model, View) => {

    const usersElement = document.getElementsByClassName("users")[0];

    Model.fetchUsers(View.displayUsers);

    let friendsOfFriends;
    let suggestedFriends;

    const handleDisplayFriends = (e) => {
        const el = e.target;
        if (el.className === "user" || el.parentNode.className === "user" || el.className === "friends-btn") {
            const userId = el.id || el.parentNode.id;

            friendsOfFriends = Model.getFriendsOfFriends(userId);
            suggestedFriends = Model.getSuggestedFriends(userId);

            Model.fetchFriends(userId, View.displayRelatedContacts);
            View.identifySelectedUser(userId);
            View.markSelectedButton();
        }
    }

    const handleDisplayFriendsOfFriends = (e) => {
        View.displayRelatedContacts(friendsOfFriends);
    }

    const handleDisplaySugestedFriends = (e) => {
        View.displayRelatedContacts(suggestedFriends);

    }

    // event listeners

    usersElement.addEventListener("click", handleDisplayFriends);

    document.getElementsByClassName("buttons-container")[0].addEventListener("click", View.markSelectedButton);
    document.getElementsByClassName("friends-btn")[0].addEventListener("click", handleDisplayFriends);
    document.getElementsByClassName("suggested-friends-btn")[0].addEventListener("click", handleDisplaySugestedFriends);
    document.getElementsByClassName("friends-of-friends-btn")[0].addEventListener("click", handleDisplayFriendsOfFriends);

})(Model, View);







