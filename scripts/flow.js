let userId = "2";
let otherId = "1";
let postsCreated = [];

let skills = [];
let question;
let instructions = {};

let minLength = 75;
let maxLength = 400;

let commenting = true;
let postsToComment = [];

const onLoad = async () => {
    getIds();

    let name    = await network.getSetName();
    let data    = await network.getData();
    skills      = name.split("_");
    question    = data.sets[name];
    instructions = data.instructions;

    let username = await network.users.validate(userId);
    if (username) {
        view.login.showPlayButton();
        view.login.disableValidateMeButton();
        view.login.setUsername(username);
    }
    
    view.login.setup(skills[0], skills[1]);
    setupEvents();

    view.loader.hide();
}

const setupEvents = () => {
    $("#validateButton").click(validateMe);
    $("#validateCollab").click(validateCollab);
    $("#playButton").click(onStart);

    $("#contentArea").attr("maxlength", maxLength);
    document.getElementById("contentArea").addEventListener("input", handleContentInputs);
    $("#continueButton").click(nextStep);
}

const validateMe = async () => {
    let username = await network.users.create($("#usernameInput").val(), userId);

    if (username) {
        view.login.showPlayButton();
        view.login.disableValidateMeButton();
    }
}

const validateCollab = async () => {
    getIds();
    let username = await network.users.validate(otherId);
}

const handleContentInputs = async () => {
    let length = $("#contentArea").val().length;

    $("#length").html(length);
    $("#maxLength").html(maxLength);

    if (length >= minLength) {
        view.enableButton("continueButton");
    } else {
        view.disableButton("continueButton");
    }
}

const nextStep = async () => {
    postsCreated.push({ title: question, rating: 0, content: $("#contentArea").val(), categories: skills, userId: userId, status: "underModeration" });

    if (postsCreated.length === 2) {
        setupCommenting();
        return;
    }

    if (otherId !== undefined) {
        let resp = await network.posts.create(postsCreated[postsCreated.length - 1]); // TODO: add error checking, for the "Copied" response first of all.
        console.log(resp);
        $("#contentArea").val("");
        handleContentInputs();
    }
}

const setupCommenting = async () => {
    commenting = true;

    for (let i = 0; i < skills.length; i++) {
        postsToComment.concat(await network.posts.list({ categories: { $all: [skills[i]] } }));
    }

    postsToComment = shuffle(postsToComment);
    view.tasks.setupCommentingView();
}

const onStart = async () => {
    view.login.closeView();
    await timeout(1000);
    view.tasks.setupPostsView(skills, instructions.create, question);
}

$(onLoad);