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

    Create frontend and connect them. (done)

    User can create new account using passport-js. (Done)
        Make sure users can’t access other pages until or unless they are logged in. (Done)
        For user to sign up make sure to get their following things: (Done)
        Username (cannot be same should be different for every user), (Done)
        Name, email, pass, description/bio. (for now these only) (Done)
        Their date of birth and their gender. (Done)

    For the password encryption we will use jwt token. (Done)
        Make sure you are getting the jwt token correctly and when log in console show that jwt token for later purposes. (Done)

    After logging in create the main dashboard just design to put coming soon but some good designing. (Done)
        Later on we will show posts etc here on this page. (Done)
        Create an header with Logout and also attach there on the homepage. Also make sure to design it and make it sticky animated. (Done)

    On the top we will create a nav bar for now only show home, create new post, Feed, Notifications and (on the left) sign out buttons for now. (Done)
        User can go home,
        Click on create new posts to create new post, (make this work later). (Done)
        Also later we will create a circle with user image and right next to it write profile for the user to go to their profile. (Later Done)
        Finally a log out btn for the user to log out. (Done)

    Design the Login and the Signup pages simple for now. (Done)
        Follow the color palette correctly. (Done)
        Design good as it'll be used later on. (Done)

    Create a Feed page which is the main posts page.
        User can see the new posts created in the middle here. (Create Later) (Section Done)
        On the left it will be menue with different options. (Done)
        On the right user image logo with it's name and suggestions where all the users will be shown with their logo/images. (Create Later)
        On the right top side of the Feed page create user name which has logged. (Done)
        It should show profile circle, right next to it should be username. (Done)
        Don’t make it clickable for now. Later user can click on it and go to their profile. (Done)

    User profile page for now show basic info. (Done)
        User can see their profile image place (can’t edit or add images for now) (Done)
        Their Right next to the profile image area the username. (Done)
        Down the user name the name of the user and under it the description. (Done)
        Also add edit user btn next to username but don’t make it work for now. (Done)
        The down area will include the posts so leave that for posts for now. (Done)

    Now make the edit btn work. User can edit their profile info and change it. (Done)
        When user clicks on edit btn it shows a pop up for the edit btn. (Done)
        For the name it could be any. (Done)
        For the image leave it for now. (Done)
        The username, email should be unique. If it is used once the user can’t use it again. (Done)
        When click on the update btn it should update all info. (Done)

    When user click on create a new post it will take them to a page for them to create a new post. (Done)
        When the user clicks create new post it will open up a pop up with a message place for the user to write the message and post it. (Done)
        Make sure that on the dashboard we can see all the posts of other users included. (Done)
        While on the profile, show only the posts of the user that is logged in. (Done)

    Create a notification side bar only for now.
        When click on it it will show a slider on which we will show the likes, comments, follow requests, and follow accepted things.

    Create a find user page.
        On this page include a search as well as show different users
        Add follow btn on each user to follow the user.
        Now if we click on the follow btn it sends follow request to the user and on the btn it shows requested.
        The follow request is shown on the notification tab of the other user.
        If the other user accepts the follow show following. ANd update the following list.
        If the other user rejects the follow request that user will be removed from the reqested list and the follow btn now instead of showing requested will showing follow again.
        And if we click on the btn showing following it unfollows them but gives us a pop up to ask weather to unfollow or not.
        Also show a requested users list separate only.
        Add a search btn so search for a specific user by their user id which is not the same one for everyone.

    On the right bar on feed page show the recommended followers.
        On the right bar on the feed page show max of 3 or less random users to follow. They will be called recommended users.
        Also create the follow btn there as well and make it work. The follow btn will work same everywhere.

    Show following and the followers of the user on the user profile.
        Make the following and the followers place work on the profile.
        Make sure when click on the following and the followers links it opens a pop up and shows the followers and the following of that user.

    Users can send follow requests to other users
        user can see the people user is following, the followers who are following the user, all other users,
        User can reject follow request and accept obviously. User can also unfollow other users.
        All following requests user have sent.

    Now Let's go back to the posts show part.
        User can like posts.
        When user clicks on the comment of feed or user profile it takes the user to that post where the user can comment.
        User can open up each post where it'll show the post and down user can comment on the post.
        User can edit the posts only the ones user created themselves.
        User can delete their own posts.

## CSS:

### Color Palette:

    Main: (60%)
        #FDFBD4
        #d9d7b6
        (Black works with it)

    Secondary: (30%)
        #878672
        (Black works with it)

    Last Touch: (10%)
        #545333
        (white works with it)

    Reverse for dark color.
