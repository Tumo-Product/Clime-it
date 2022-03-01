const posts = {
    currData: {},
    opened  : {},

    reset: () => {
        posts.currData = {};
        posts.opened   = {};
        postsView.elements = {}
        postsView.commentsOpened = {};
        $("#postsContainer").empty();
    },

    setup: async (queries) => {
        if (!queries) {
            $("#firstView").addClass("disabled");
            
            for (let i = 0; i < skills.length; i++) {
                for (let q = 0; q < questions[skills[i]].length; q++) {
                    let question = questions[skills[i]][q];
                    let found = await network.posts.list({ title: question });

                    for (let f = 0; f < found.length; f++) {
                        found[f].username = await network.users.validate(found[f].userId);
                    }

                    if (found.length > 0) {
                        posts.currData[question] = found;
                        posts.opened[question] = false;
                    }
                }
            }

            $("#filter").css("display", "flex");
            view.move(-1);
        }

        if (Array.isArray(queries)) {
            for (let i = 0; i < queries.length; i++) {
                let found = await network.posts.list(queries[i]);

                for (let f = 0; f < found.length; f++) {
                    found[f].username = await network.users.validate(found[f].userId);
                    posts.currData[found[f].title] = found;
                    posts.opened[found[f].title] = false;
                }
            }
        }

        posts.add(posts.currData);
    },

    add: async (data) => {
        let questions = [];
        let ratings = [];
        for (const question in data) {
            questions.push(question);
        }

        for (const question in data) {
            let element = postsView.addQuestion(question, data[question][0].categories);
            let opener = element.find(".opener");
            opener.click(() => { posts.togglePosts(question, opener) });
        }
    },

    togglePosts: async (question, opener) => {
        if (posts.opened[question]) {
            let postIds = [];
            for (let i = 0; i < posts.currData[question].length; i++) {
                postIds.push(posts.currData[question][i].pid);
            }
            
            postsView.removePosts(postIds);
            view.replaceButton(opener, ".plus");
            posts.opened[question] = false;
        } else {
            view.replaceButton(opener, ".minus");
            postsView.addPosts(posts.currData[question], postsView.elements[question]);
            posts.opened[question] = true;
        }
    },

    rate: async (pid, value) => {
        await network.posts.rate(pid, value);
    }
}

const postsView = {
    elements: {},
    commentsOpened: {},

    addQuestion: (title, skills) => {
        let element = $(`
        <div class="contentsContainer">
            <div class="skillsContainer">
                <div class="skills"></div>
            </div>
            <p class="title">${title}</p>

            <div class="opener button">
                <img class="icon minus"         src="../icons/minus.png">
                <img class="icon plus current"  class="plus"  src="../icons/plus.png">
            </div>
        </div>`);
        $("#postsContainer").append(element);
        
        view.addSkills(element, skills);
        postsView.elements[title] = element;
        return element;
    },

    addPosts: (posts, after) => {
        let elements = [];
        
        for (let i = 0; i < posts.length; i++) {
            let date = new Date(posts[i].date).toString();
            let segments = date.split(" ");
            segments.splice(4);
            date = segments.join(" ");

            postsView.commentsOpened[posts[i].pid] = false;

            let element = $(`
            <div class="postContainer" id="${posts[i].pid}">
                <div class="post">
                    <div class="ratingContainer">
                        <div class="ratingSubContainer button" onclick="posts.rate('${posts[i].pid}', 1)">
                            <img class="icon current" src="../icons/increment.png">
                        </div>

                        <div class="separator"></div>

                        <div class="ratingSubContainer button" onclick="posts.rate('${posts[i].pid}', -1)">
                            <img class="icon current" src="../icons/decrement.png">
                        </div>
                    </div>

                    <div class="postSeparator"></div>

                    <div class="mainContentContainer">
                        <p class="username">${posts[i].username}</p>
                        <p class="date">${date}</p>
                        <p class="postContent">${posts[i].content}</p>
                    </div>

                    <div class="opener button" onclick="postsView.toggleComments('${posts[i].pid}')">
                        <img class="icon" src="../icons/minus.png">
                        <img class="icon current" src="../icons/plus.png">
                    </div>
                </div>

                <div class="postComments closedVertically">
                    <p class="header">Comments</p>
                    <div class="headerSeparator"></div>
                </div>
            </div>`);

            elements.push(element);

            if (Array.isArray(posts[i].comments)) {
                let comments = posts[i].comments;

                for (let i = 0; i < comments.length; i++) {
                    let date = new Date(comments[i].date).toString();
                    let segments = date.split(" ");
                    segments.splice(4);
                    date = segments.join(" ");

                    element.find(".postComments").append(`
                    <div class="postComment">
                        <span class="username">${comments[i].username}</span>
                        <span class="date">${date}</span>
                        <p class="postContent">${comments[i].content}</p>
                    </div>`);
                }
            } else {
                element.find(".opener").remove();
            }
        }

        after.after(elements);
    },

    toggleComments: async (pid) => {
        if (postsView.commentsOpened[pid]) {
            $(`#${pid}`).css("margin-bottom", 24);
            $(`#${pid} .postComments`).addClass("closedVertically");
            postsView.commentsOpened[pid] = false;
        } else {
            $(`#${pid}`).css("margin-bottom", 0);
            $(`#${pid} .postComments`).removeClass("closedVertically");
            postsView.commentsOpened[pid] = true;
        }
    },

    removePosts : async (postIds) => {
        for (let pid of postIds) {
            $(`#${pid}`).remove();
        }
    }
}