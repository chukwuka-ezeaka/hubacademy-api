
const User = require('./models.user');
const UserRole = require('./models.user_role');
const Role = require('./models.role');
const Permission = require('./models.permission');
const RolePermission = require('./models.role_permission');
const Reflection = require('./models.reflection');
const ContentCategory = require('./models.contentcategory');
const ContentType = require('./models.contenttype');
const Content = require('./models.content');
const MediaLink = require('./models.medialink');
const Likeable = require('./models.likeable');
const LikeCounter = require('./models.likecounter');
const Post = require('./models.post');
const Comment = require('./models.comment');
const Transaction = require('./models.transaction');
const Wallet = require('./models.wallet');
const WalletTransaction = require('./models.wallet.transactions');
const SubscriptionSettings = require('./models.subscription_setting');
const Subscription = require('./models.subscription');
const Follower = require('./models.follower');
const Review = require('./models.review');
const Settlement = require('./models.settlement');
const GlobalSetting = require('./models.global_settings');
const UserDevice = require('./models.user_device');
const Notification = require('./models.notification');
const Conversation = require('./models.conversation')
const Message = require('./models.message');
const CounsellorSetting = require('./model.counsellor.settings')



//Setup relationships
User.hasOne(UserRole,{foreignKey:'userId'})
User.belongsTo(ContentCategory,{foreignKey:'category_id', as:'category'})
User.hasMany(Content,{foreignKey:'owner_id'})
User.hasMany(Wallet,{foreignKey:'holder_id', as:'wallets'})
User.hasMany(Subscription,{foreignKey:'authorId'})
User.hasOne(LikeCounter,{foreignKey:'likeableId', as:'likeCount',scope: {likeableType: 'user'}})
User.hasMany(Follower,{foreignKey:'followableId', as:'followers',scope: {followableType: 'user'}})
User.hasMany(Review,{foreignKey:'reviewableId', as:'reviews',scope: {followableType: 'reviewableType'}})
Follower.hasOne(User,{foreignKey:'id',sourceKey:'followerId'})
UserRole.belongsTo(Role,{foreignKey:'roleId'})
Role.hasMany(RolePermission,{foreignKey:'roleId'})

// chat
// User.hasMany(Conversation,{foreignKey:'from'})
// User.hasMany(Conversation,{foreignKey:'to'})
// User.hasMany(Message,{foreignKey:'from'})
// User.hasMany(Message,{foreignKey:'to'})
// Conversation.belongsTo(User,{foreignKey:'to'})
// Conversation.belongsTo(User,{foreignKey:'from'})
// Message.belongsTo(User,{foreignKey:'to', as: 'receiver'})
// Message.belongsTo(User,{foreignKey:'from', as: 'sender'})



Permission.hasMany(RolePermission,{foreignKey:'permissionId'})
Permission.belongsToMany(Role,{foreignKey:'permissionId', through:'RolePermission'})
RolePermission.belongsTo(Role,{foreignKey:'roleId'})
RolePermission.belongsTo(Permission,{foreignKey:'permissionId'})
// Permission.belongsTo(RolePermission,{foreignKey:'permissionId'})
Role.belongsToMany(Permission,{through:RolePermission,foreignKey: 'roleId', onDelete: 'CASCADE'})
Permission.belongsToMany(Role,{through:RolePermission,foreignKey: 'permissionId', onDelete: 'CASCADE'})


//Media
MediaLink.belongsTo(ContentCategory,{foreignKey:'category_id', as: 'category'})
MediaLink.belongsTo(User,{foreignKey:'owner_id', as: 'owner'})
MediaLink.belongsTo(ContentType,{foreignKey:'type_id', as: 'media_type'})

// ContentType.hasOne(MediaLink,{foreignKey:'type_id', as:'media'})

//Content
Content.belongsTo(ContentCategory,{foreignKey:'category_id', as: 'category'})
Content.belongsTo(ContentType,{foreignKey:'contenttype_id', as: 'content_type'})
Content.belongsTo(User,{foreignKey:'owner_id', as: 'owner'})
Content.belongsTo(MediaLink,{foreignKey:'art_id',targetKey:'id', as: 'content_art'})
Content.belongsTo(MediaLink,{foreignKey:'content_media_id',targetKey:'id', as: 'content_media'})
Content.hasOne(LikeCounter,{foreignKey:'likeableId', as:'likeCount',scope: {
        likeableType: 'content'
    }})


//Comment
Comment.belongsTo(User,{foreignKey:'userId', as:'commenter'})
Comment.hasOne(LikeCounter,{foreignKey:'likeableId', as:'likeCount',scope: {
        likeableType: 'comment'
    }})

//Post
Post.hasMany(Comment,{foreignKey:'postId', as:'comments'})
Post.hasOne(LikeCounter,{foreignKey:'likeableId', as:'likeCount',scope: {likeableType: 'post'}})


//Wallet
Wallet.hasMany(WalletTransaction,{foreignKey:'wallet_id', as:'transactions'})
// db.sync();

//Review
Review.hasOne(User,{foreignKey:'id',sourceKey:'userId', as:'reviewBy'})

//Content Purchase
Subscription.hasOne(Content,{foreignKey:'id',sourceKey:'contentId', as:'content'})
Subscription.hasOne(User,{foreignKey:'id',sourceKey:'authorId', as:'author'})
Subscription.hasOne(ContentCategory,{foreignKey:'id',sourceKey:'categoryId', as:'category'})



module.exports = {
    User,
    Role,
    UserRole,
    Permission,
    RolePermission,
    Reflection,
    ContentCategory,
    ContentType,
    Content,
    MediaLink,
    Likeable,
    LikeCounter,
    SubscriptionSettings,
    Post,
    Comment,
    Transaction,
    Wallet,
    WalletTransaction,
    Subscription,
    Follower,
    Review,
    Settlement,
    GlobalSetting,
    UserDevice,
    Notification,
    Conversation,
    Message,
    CounsellorSetting
};
