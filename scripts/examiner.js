let responses;
let curr = 0;
let reviewingComments = false;
let commenting = false;

getIds();

const onExaminerLoad = async () => {
    let name    = await network.getSetName();
    let data    = await network.getData();
    skills      = name.split("_");
    instructions = data.instructions;

    let post = await network.posts.list({ pid: responses[0] });
    post = post[0];
    view.tasks.setupPostsView(skills, instructions.create, post.title);
    $("#contentArea").val(post.content);
    $("#length").html(post.content.length);

    setupEvents();
    view.loader.hide();
}

const setupEvents = () => {
    $("#awardButton").click(()  => { moveToNext(true) });
    $("#rejectButton").click(() => { moveToNext(false)});
}

const moveToNext = async (award) => {
    if (typeof(responses[curr]) === "string") {
        if (award) {
            await network.posts.publish(responses[curr]);
        } else {
            await network.posts.delete(responses[curr]);
        }
    } else {
        if (award) {
            await network.posts.comment(responses[curr]);
        }
    }

    curr++;

    if (typeof(responses[curr]) === "string") {
        let post = (await network.posts.list({ pid: responses[curr] }))[0];
        post = post[0];
        view.tasks.setQuestion(post.title);
        $("#contentArea").val(post.content);
        $("#length").html(post.content.length);
    } else if (typeof(responses[curr]) === "object") {
        let post = (await network.posts.list({ pid: responses[curr].pid }))[0];
        view.tasks.setQuestion(post.title);

        if (!commenting) {
            commenting = true;
            view.tasks.setupCommentingView(post.content);
            $("#maxLength").html(200);
        } else {
            view.tasks.setContent(post.content);
        }

        $("#contentArea").val(responses[curr].comment);
    } else {
        $(".navigator").addClass("deactivated disabled");
    }
}

// $(onExaminerLoad);