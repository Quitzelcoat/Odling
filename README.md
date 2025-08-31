# Odling

## Project: Odin-Book

### Main Functions:

    User can signup and login.
    User can create posts (text only for now)
    User can like other users posts and comment on them.
    Page where it shows the new posts of the users we are following.
    Can send and receive follow requestes.
    User can get notifications for follow requests.
    User should be able to post images now as well (using cloudinary or superbase storage)
    Users should be able to update their profile photo.
    User can login as a guest user without an account or any credentials.

### To Do First:

    Create a signup and login page. Remember to choose which authentication method you should use.
    The main dashboard, where the user can view the posts of people that the user is following.
    User should be able to create posts, but only text for now.
    Each post shows the user’s author, likes, and comments.
    The user can like and comment.
    User profile page (basic info only and no images yet).
    Basic info includes: Profile info, empty place for image for now, all posts of that user.
    Edit button for the user to edit their profile info.
    User can change email, password, username (only the one which was not used before), name (could be same doesn’t matter), bio.
    Show a list of all users and a follow button to send a request to other users.
    Now the feed. It should show the posts of the people that the user is following.

### Later On:

    Profile picture (Gravatar or uploads)
    Users can update/change their profile photos.
    Should be able to upload images with the posts (Cloudinary/Supabase).
    Guests Login without account.
    UI/UX design.
    Deploy online for everyone to see.

### Database:

        User:
            id, username, name, email, password, bio, dob(date of birth), gender, createdAt, updatedAt, posts, comments, likes, sentFollowRequest,
            receivedFollowRequest, followers, following, notifications, deletedAt.

        Post:
            id, author, authorId, content, createdAt, updatedAt, comments, likes, isDeleted

        Comments:
            id, author, authorId, post, postId, content, parentId, createdAt

        Likes:
            id, user, userId, post, postId, createdAt

        follower:
            id, sender, senderId, receiver, receiverId, status, createdAt, updatedAt

        following:
            id, follower, followerId, following, followingId, createdAt

        notification:
            id, user, userId, type, data, isRead, createdAt

### Implementation and Tools:

    First thing set up the backend. (done)

    Create the database and set it up. (done)

    Create frontend and connect them.

    User can create new account using passport-js.
        Make sure users can’t access other pages until or unless they are logged in.
        For user to sign up make sure to get their following things:
        Username (cannot be same should be different for every user),
        Name, email, pass, description/bio. (for now these only)
        Their date of birth and their gender.
        Also in place of user image we can create a small circle for now.(don’t worry about choosing the img for now we will do that later).

    For the password encryption we will use jwt token.
        Make sure you are getting the jwt token correctly and when log in console show that jwt token for later purposes.

    After logging in create the main dashboard just design to put coming soon but some good designing.
        Later on we will show posts etc here on this page.

    On the right side create user name which has logged in.
        It should show profile circle, right next to it should be username.
        Don’t make it clickable for now. Later user can click on it and go to their profile.

    On the left we will create a nav bar for now only show home, create new post, and (on the down) sign out buttons for now. (sign out doesn’t need to work for now).
        User can go home,
        Click on create new posts to create new post,
        Also later we will create a circle with user image and right next to it write profile for the user to go to their profile.
        Finally a log out btn for the user to log out. It doesn’t have to work for now just show it’s there we will work on it later.

    User profile page for now show basic info.
        User can see their profile image place (can’t edit or add images for now)
        Their Right next to the profile image area the username.
        Down the user name the name of the user and under it the description.
        Also add edit user btn next to username but don’t make it work for now.
        The middle and the down area will include the posts so leave that for posts for now.

    When user click on create a new post it will take them to a page for them to create a new post.
        When the user clicks create new post it will open up a pop up with a message place for the user to write the message and post it.
        Also add a discharge/close button for them to close the pop up or just click out of the pop up and it will close.
        When the user posts the middle area of the dashboard show the users image and on the profile of the user show the image of all the users.
        But make sure that on the dashboard we can see all the images of other users included.
        While on the profile, show only the posts of the user that is logged in.

    Now make the edit btn work. User can edit their profile info and change it.
        When user clicks on edit btn it shows a pop up for the edit btn.
        For the name it could be any.
        For the image leave it for now.
        The username, email should be unique. If it is used once the user can’t use it again.
        The password to change user has to write previous password. For the security this is enough for now.
        When click on the update btn it should update all info.

    On left bar have a friend’s btn to access friends page.
        On the page show 3 things.
        1 suggestions. In this show all the users.
        2 requests. The users we have sent the friend request.
        3 friends. It shows all the friends which we already follow.
        On the friends page only show suggestions and for 2 and 3 show it on the profile page.
        Show the suggestions tab with randomly choosing 5 users max on the dashboard right side.
        For now don’t show the follow btn.

    ALso create a notification page. And on the left side create the btn to access.
        Inside the notification page when we click it should show friend request from other users with a deny and accept btns.

    Create a follow btn next to suggested users and let the user follow others.
        Do this on both dashboard and friends page.
        When the user clicks on the follow btn show requested on that btn and also send the request to the other user.
        And for the other user to receive the friend request first create the notification page.
        If follow request accepted we can see their profiles but only see them.
        And also add those users which we sent request to the request place.
        When a user accepts the follow request remove them from request place and add to the friends list.
        If denied remove from the request page only and don’t remove from the suggestions section tho. But change the request btn to follow btn.
