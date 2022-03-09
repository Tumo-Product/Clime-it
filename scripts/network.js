axios.defaults.baseURL = "https://content-tools.tumo.world:4000";

const config = {
    users: {
        validate    : '/climate/users/validate',
        create      : '/climate/users/create',
        addRating   : '/climate/users/add_rating'
    },
    posts: {
        comment     : '/climate/posts/comment',
        create      : '/climate/posts/create',
        delete      : '/climate/posts/delete',
        update      : '/climate/posts/update',
        updateOne   : '/climate/posts/update_one',
        list        : '/climate/posts/list',
    }
}

const network = {
    getSetName: async () => {
        let href = document.location.href;
        let splitPath = href.split("/");
        let string = splitPath[splitPath.length - 2];
        return string;
    },
    getData: async () => {
        let data;
        await $.get(`../data.json`, function (json) { data = json; });
        return data;
    },

    users: {
        validate: async (userId) => {
            let resp = await axios.post(config.users.validate, { userId: userId });
            return resp.data.found === undefined ? false : resp.data.found;
        },
        create: async (username, userId) => {
            let resp = await axios.post(config.users.create, {username: username, userId: userId });
            return resp.data.added === undefined ? false : resp.data.added.username;
        },

        addRating: async (pid, rating) => {
            let resp = await axios.post(config.users.addRating, { userId: userId, rating: rating, pid: pid });
            return resp.data.added === undefined ? false : true;
        }
    },
    
    posts: {
        list: async (query) => {
            let resp = await axios.post(config.posts.list, { query: query === undefined ? "{}" : JSON.stringify(query) });
            return resp.data.found;
        },

        create: async (post) => {
            let resp = await axios.post(config.posts.create, { post: JSON.stringify(post) });
            return resp.data.added;
        },

        comment: async (obj) => {
            return await axios.post(config.posts.comment, { pid: obj.pid, userId: obj.userId, comment: obj.comment });
        },

        rate: async (pid, value) => {
            return await axios.post(config.posts.update, { values: JSON.stringify({ $inc: { rating: value} }), pid: pid });
        },

        publish: async (pid) => {
            return await axios.post(config.posts.updateOne, { values: JSON.stringify({ status: "published" }), pid: pid });
        },

        delete: async (pid) => {
            return await axios.post(config.posts.delete, { pid: pid });
        }
    }
}