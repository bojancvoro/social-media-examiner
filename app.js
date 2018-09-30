// to run project:
// npm install
// npm run json-server - to start json server
// npm start - to start development server

const Model = (() => {

    const endpoint = "http://localhost:3000/users/";
    let group;

    function checkError(response) {
        if(!response.ok) {
            throw Error
        }
        return response;
    }

    fetchUsers = (displayUsers, displayErrorMsg) => {
        fetch(endpoint)
            .then(checkError)
            .then(response => response.json())
            .then(data => {
                group = data;
                return data
            })
            .then(data => {
                displayUsers(data);
            })
            .catch(displayErrorMsg);
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
        // receives user id; returns (a promise that resolves to) array of friends objects 
        return fetch(endpoint + userId)
            .then(response => response.json())
            .then(data => data.friends)
            .then(friends => _parseFriends(friends))
            .then(parsedFriends => {
                if(displayContacts) {
                    displayContacts(parsedFriends)
                }
                return parsedFriends;
            })
    }

    const fetchFriendsOfFriends = (userId) => {
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
        // takes user's id; returns an array of suggested friends
        const suggestedFriends = [];
        // get user friends' ids from the user's object
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
        fetchFriendsOfFriends,
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
            relatedContactsElement.innerHTML = "<p>No contacts to display.</p>";
        }
    }

    const identifySelectedUser = (userId) => {
        const allUserElements = document.getElementsByClassName("user");
        const clickedUserElement = document.getElementById(userId);
        const friendsBtn = document.getElementsByClassName("friends-btn")[0];

        Array.from(allUserElements).forEach((element) => {
            element.classList.remove("selected");
        });
        clickedUserElement.classList.add("selected");

        friendsBtn.id = userId;
    }

    const markSelectedButton = (e) => {
        const allButtons = document.getElementsByClassName("buttons-container")[0].children;
        Array.from(allButtons).forEach((button) => {
            button.classList.remove("selected");
        });
        if(e){
            const lastClickedButton = e.target;
            lastClickedButton.classList.add("selected");
        } else {
            const friendsBtn = document.getElementsByClassName("friends-btn")[0];
            friendsBtn.classList.add("selected");
        }
    }

    const displayErrorMessage = () => {
        const usersElement = document.getElementsByClassName("users")[0];
        const errorMsgElement = document.createElement("p");
        errorMsgElement.classList.add("error");
        errorMsgElement.innerHTML = "We could't get requested data. Please try reloading the page."
        usersElement.appendChild(errorMsgElement);
    }

    return {
        displayUsers,
        displayRelatedContacts,
        identifySelectedUser,
        markSelectedButton,
        displayErrorMessage
    }

})();

// CONTROLLER

const Controller = ((Model, View) => {

    const usersElement = document.getElementsByClassName("users")[0];
    const buttonsContainer = document.getElementsByClassName("buttons-container")[0];
    const friendsButton = document.getElementsByClassName("friends-btn")[0];
    const suggestedFriendsButton = document.getElementsByClassName("suggested-friends-btn")[0];
    const friendsOfFriendsButton = document.getElementsByClassName("friends-of-friends-btn")[0];

    Model.fetchUsers(View.displayUsers, View.displayErrorMessage);

    let friendsOfFriends;
    let suggestedFriends;

    const handleDisplayFriends = (e) => {
        const el = e.target;
        if (el.className === "user" || el.parentNode.className === "user" || el.className === "friends-btn") {
            const userId = el.id || el.parentNode.id;

            friendsOfFriends = Model.fetchFriendsOfFriends(userId);
            suggestedFriends = Model.getSuggestedFriends(userId);

            Model.fetchFriends(userId, View.displayRelatedContacts, View.displayErrorMessage);
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

    usersElement.addEventListener("click", handleDisplayFriends);
    buttonsContainer.addEventListener("click", View.markSelectedButton);
    friendsButton.addEventListener("click", handleDisplayFriends);
    suggestedFriendsButton.addEventListener("click", handleDisplaySugestedFriends);
    friendsOfFriendsButton.addEventListener("click", handleDisplayFriendsOfFriends);

})(Model, View);







