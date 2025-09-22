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

    Create a notification side bar only for now. (Done)
        When click on it it will show a slider on which we will show the likes, comments, follow requests, and follow accepted things. (Done)

    Create a find user page. (Done)
        On this page include a search as well as show different users (Done)
        Add follow btn on each user to follow the user. (Done)
        Add a search btn so search for a specific user by their user id which is not the same one for everyone. (Done)
        Now if we click on the follow btn it sends follow request to the user and on the btn it shows requested. (Done)
        User can view other users profile and interact with them. Put on the profile how it shows on the user profile instead of editing or stuff of that user we can only request to follow them and see the posts and stuff with their posts followers etc. IF already sent follow request will show requested etc. (Done)
        The follow request should show on the notification tab of the other user (the one we sent the follow request) (If request canceled remove the follow request notification so it doesn't create any problem) And sent to the other user. Make the notification bar work for getting the friend requests now. (Done)
        If the other user rejects the follow request that user will be removed from the reqested list and the follow btn now instead of showing requested will be showing follow again.(Done)
        User can accept and reject the follow request.(Done)
        Make sure to add the accept and reject btn inside the notification bar for them as well.(Done)
        Now the follow btn should show following if the user we sent friend request to accepts it on the friend page (On their profile it's showing correctly).(Done)
        And if we click on follow btn again after unfollowing it should give us a popup saying are you sure to unfollow. And if we unfollow it removes from our following list. Also make sure all of this is also updated over the database because that's important.(Done)
        If the other user accepts the follow show following on that user. And update the following list on the profile page.(Done)
        On the profile page of the user update the following and followers list. Also when click on the list it should show the popup with the followers one with the followers, and following one with users we are following.(Done)
        Also if the user has sent the follow request it should also show the request on that user's profile page and also the btn which says follow should say accept request or something so that it's clear for the user.(Done)
        And if we click on the btn showing following it unfollows them but gives us a pop up to ask weather to unfollow or not.(Done)

    On the right bar on feed page show the recommended followers.(Done)
        On the right bar on the feed page show max of 3 or less random users to follow. They will be called recommended users.(Done)
        Also create the follow btn there as well and make it work. The follow btn will work same everywhere.(Done)

    Show following and the followers of the user on the user profile.(Done)
        Make the following and the followers place work on the profile.(Done)
        Make sure when click on the following and the followers links it opens a pop up and shows the followers and the following of that user.(Done)

    Users can send follow requests to other users(Done)
        user can see the people user is following, the followers who are following the user, all other users,(Done)
        User can reject follow request and accept obviously. User can also unfollow other users.(Done)
        All following requests user have sent.(Done)

    Now Let's go back to the posts show part.(Done)
        User can like posts.(Done)
        Also show the like posts on the notification as well.(Done)
        When user clicks on the comment of feed or user profile it takes the user to that post where the user can comment.(Done)
        If the user comments it should also show on the notification.(Done)
        User can open up each post where it'll show the post and down user can comment on the post.(done)
        User can edit the posts only the ones user created themselves.(Done)
        User can delete their own posts.(Done)

    Make the Images Work. (Done)
        First make the backend so that the user can create images and save it in the backend. If possible use gravatar.(Done)
        Second Now create it's frontend to fetch the images links from the database and take them to the frontend and show them on the frontend.(Done)
        Now make the images appear on all the places.(Done)

    The Main extra functions.
        Firstly the user can create new posts with images. Check the odin for how and where to save those images.(Done)
        Now change their profile photos.(Done)
        Guest users can sign in to test the app.
        Make the deisgn futuristic and simple.

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
