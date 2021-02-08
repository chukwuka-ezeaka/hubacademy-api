const acl = require('../../acl/acl.index')
module.exports = function(app) {
    app.use('/api/v1', require('../../app/routes/routes.noauth'));
    app.use('/api/v1/account', [acl.isAuthenticated], require('../../app/routes/routes.account'));
    app.use('/api/v1/region', [acl.isAuthenticated], require('../../app/routes/routes.region'));
    app.use('/api/v1/transaction', [acl.isAuthenticated], require('../../app/routes/routes.transaction'));
    app.use('/api/v1/reflection', [acl.isAuthenticated], require('../../app/routes/routes.reflection'));
    app.use('/api/v1/content/category', [acl.isAuthenticated], require('../../app/routes/routes.content.category'));
    app.use('/api/v1/content/type', [acl.isAuthenticated], require('../../app/routes/routes.content.type'));
    app.use('/api/v1/content/media', [acl.isAuthenticated], require('../../app/routes/routes.medialink'));
    app.use('/api/v1/content', [acl.isAuthenticated], require('../../app/routes/routes.content'));
    app.use('/api/v1/post', [acl.isAuthenticated], require('../../app/routes/routes.post'));
    app.use('/api/v1/post/comment', [acl.isAuthenticated], require('./routes.post.comment'));
    app.use('/api/v1/media/manager', [acl.isAuthenticated], require('./routes.media.manager'));
    app.use('/api/v1/user', [acl.isAuthenticated], require('./routes.user'));
    app.use('/api/v1/settings', [acl.isAuthenticated], require('./routes.settings'));
    app.use('/api/v1/wallet', [acl.isAuthenticated], require('./routes.wallet'));
    app.use('/api/v1/subscription', [acl.isAuthenticated], require('./routes.subscription'));
    app.use('/api/v1/store', [acl.isAuthenticated], require('./routes.store'));
    app.use('/api/v1/review', [acl.isAuthenticated], require('./routes.review'));
    app.use('/api/v1/settlement', [acl.isAuthenticated], require('./routes.settlement'));
    app.use('/api/v1/device', [acl.isAuthenticated], require('./routes.device'));
    // app.use('/api/v1/admin', [], require('../../app/routes/routes.admin'));
};
