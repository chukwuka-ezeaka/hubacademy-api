const Joi = require('@hapi/joi');

const sendEmail = Joi.object({
    message: Joi.string()
        .alphanum()
        .min(3)
        .required(),

    to: Joi.string()
        .min(3)
        .email({minDomainSegments: 2})
        .required(),

})

const closeTransaction = Joi.object({
    trans_ref: Joi.string()
        .required(),
    amount: Joi.number()
        .required(),
})

const startTransaction = Joi.object({
    amount: Joi.number()
        .required(),
})

const createUser = Joi.object({
    firstname: Joi.string()
        .min(3)
        .required(),
    lastname: Joi.string()
        .min(3),
    email: Joi.string()
        .min(3)
        .email({minDomainSegments: 2})
        .required(),
    role: Joi.number()
        .required(),
    username: Joi.string(),
    country_name: Joi.string(),
    photo: Joi.string(),
    about: Joi.string(),
    phone: Joi.string(),
    birthday: Joi.date(),
    password: Joi.string().trim().min(5).max(50).required(),
    fcmToken: Joi.string()
})

const createReflection = Joi.object({
    title: Joi.string()
        .min(3)
        .required(),
    author: Joi.string()
        .min(3)
        .required(),
    content: Joi.string()
        .min(3)
        .required(),
    date: Joi.date().iso()
        .required(),
    image_link: Joi.string()
        .min(3),
    audio_link: Joi.string()
        .min(3),
})

const createContentCategory = Joi.object({
    name: Joi.string()
        .min(3)
        .required(),
    description: Joi.string(),
    image_url: Joi.string()
})

const updateContentCategory  =
    Joi.object({
        name: Joi.string().trim().required(),
        description: Joi.string(),
        image_url: Joi.string()
    });


//Media Link
const createMediaLink = Joi.object({
    url: Joi.string()
        .required(),
    owner_id: Joi.number()
        .required(),
    category_id: Joi.number()
        .required(),
    type_id: Joi.number()
        .required(),
    title: Joi.string(),
    description: Joi.string(),
    tags: Joi.string(),
    status: Joi.number(),
    admin: Joi.number(),
})

//Content
const createContent = Joi.object({
    title: Joi.string().min(3)
        .required(),
    description: Joi.string().min(3)
        .required(),
    owner_id: Joi.number()
        .required(),
    category_id: Joi.number()
        .required(),
    content_type_id: Joi.number()
        .required(),
    content_media_id: Joi.number()
        .required(),
    art_id: Joi.number(),
    status: Joi.number(),
    price: Joi.number(),
    sale_price: Joi.number(),
    currency: Joi.string(),
    free: Joi.number()

})

const updateContent = Joi.object({
    title: Joi.string().min(3)
        .required(),
    description: Joi.string().min(3)
        .required(),
    owner_id: Joi.number()
        .required(),
    category_id: Joi.number()
        .required(),
    contenttype_id: Joi.number()
        .required(),
    art_id: Joi.string().required(),
    status: Joi.number().required(),
    price: Joi.number().required(),
    sale: Joi.number(),
    sale_price: Joi.number().required(),
    currency: Joi.string().required(),
    free: Joi.number().required(),

})

const updateUser = Joi.object({
    firstname: Joi.string()
        .alphanum()
        .min(3)
        .required(),
    lastname: Joi.string()
        .alphanum()
        .min(3)
        .required(),
    email: Joi.string()
        .min(3)
        .email({minDomainSegments: 2})
        .required(),
    role: Joi.number()
        .required(),
    phone: Joi.string()
        .required(),
    username: Joi.string()
        .required(),
    country_name: Joi.string()
        .required(),
    birthday: Joi.string()
        .required(),
    online: Joi.string()
        .required(),
    about: Joi.string(),
    address: Joi.string()
        .required(),
    years_of_experience: Joi.string()
        .required(),
    pitch_video_link: Joi.string()
        .required(),
    photo: Joi.string()
        .required(),
    user_key: Joi.string()
        .required(),
})

const serverNotification = Joi.object({
    message: Joi.string()
        .min(3)
        .required()
})

const userLogin =
    Joi.object({
        email: Joi.string().trim().email({ minDomainSegments: 2 }).required(),
        password: Joi.string().trim().min(5).max(50).required(),
        fcmToken: Joi.string()
    });

const createRole  =
    Joi.object({
        name: Joi.string().trim().required(),
        permissions: Joi.array().min(2).required()
    });

const updateRole  =
    Joi.object({
        name: Joi.string().trim().required()
    });

const createPermission  =
    Joi.object({
        name: Joi.string().trim().required()
    });

const updatePermission  =
    Joi.object({
        id: Joi.number().required(),
        name: Joi.string().trim().required()
    });

const assignRole  =
    Joi.object({
        user_id: Joi.number().required(),
        role_id: Joi.number().required()
    });

//Like
const Likeable = Joi.object({
    id: Joi.number()
        .required(),
    action: Joi.string()
        .required()

})


//Upload Image
const imageUpload = Joi.object({
    owner_id: Joi.number()
        .required(),
    type_id: Joi.number()
        .required(),
    category_id: Joi.number()
        .required()

})

const profileUpload = Joi.object({
    image: Joi.string()
        .required()
})

//Notes
const createNote = Joi.object({
    content: Joi.string()
        .min(3)
        .required(),
    status: Joi.string(),
    tags: Joi.string()
})

//Wallet
const creditWallet = Joi.object({
    amount: Joi.number().required(),
    trans_ref: Joi.string().required(),
})

//Comment
const createComment = Joi.object({
    content: Joi.string()
        .min(3)
        .required(),
    status: Joi.string(),
    postId: Joi.number().required(),
})

//Review
const createReview = Joi.object({
    content: Joi.string()
        .min(3)
        .required(),
    status: Joi.string(),
    reviewableId: Joi.number().required(),
    reviewableType: Joi.string().required(),
})

const updateReview = Joi.object({
    content: Joi.string()
        .min(3)
        .required(),
    status: Joi.string(),
    reviewableType: Joi.string().required(),
})

//subscription
const subscribe = Joi.object({
    subscription_genus: Joi.string().valid('author', 'category','content').required(),
    subscription_type: Joi.string().valid('purchase', 'subscription').required(),
    authorId: Joi.number(),
    categoryId: Joi.number(),
    contentId: Joi.number(),
    expiresAt: Joi.date().required(),
    amount: Joi.number().required(),
})

//subscribe to author
const subscribeToAuthor = Joi.object({
    duration: Joi.string().valid('daily', 'weekly','semi_weekly','monthly','semi_monthly','quarterly','biyearly','yearly').required(),
    authorId: Joi.number().required(),
    forceSubscription: Joi.string().required(),
    amount: Joi.number().required(),
})

//subscribe to category
const subscribeToCategory = Joi.object({
    duration: Joi.string().valid('daily', 'weekly','semi_weekly','monthly','semi_monthly','quarterly','biyearly','yearly').required(),
    categoryId: Joi.number().required(),
    forceSubscription: Joi.string().required(),
    amount: Joi.number().required(),
})

//purchase content
const subscribeToContent = Joi.object({
    contentId: Joi.number().required(),
    authorId: Joi.number().required(),
    amount: Joi.number().required(),
})

//purchase content direct
const purchaseContentDirect = Joi.object({
    contentId: Joi.number().required(),
    authorId: Joi.number().required(),
    amount: Joi.number().required(),
    transaction_ref: Joi.string().required(),
})


//Councellor Settings
const updateCounsellorSettings = Joi.object({
    chat_price: Joi.number().required(),
    video_price: Joi.number(),
    call_price: Joi.number().required(),
    share_percentage: Joi.number().required(),
})


//Settings
const updateSubscriptionSettings = Joi.object({
    global_subscription_by: Joi.string().required(),
    global_subscription_promo_type: Joi.string(),
    global_subscription_interval: Joi.string().required(),
    global_subscription_amount: Joi.number().required(),
    global_subscription_promo_amount: Joi.number(),
    global_subscription_status: Joi.number(),
})

//Settlement
const createAccount = Joi.object({
    account_number: Joi.string().required(),
    bank_code: Joi.string(),
    bank_name: Joi.string().required()
})

//Settlement
const requestPayout = Joi.object({
    amount: Joi.number().required()
})

const linkDevice = Joi.object({
    device_id: Joi.string().required(),
    fcm_token: Joi.string().required()
})

module.exports = {
    sendEmail,
    createUser,
    updateUser,
    serverNotification,
    userLogin,
    createRole,
    createPermission,
    assignRole,
    updateRole,
    updatePermission,
    createReflection,
    createContentCategory,
    updateContentCategory,
    createMediaLink,
    createContent,
    updateContent,
    Likeable,
    imageUpload,
    profileUpload,
    createNote,
    createComment,
    startTransaction,
    closeTransaction,
    updateSubscriptionSettings,
    creditWallet,
    subscribe,
    createReview,
    updateReview,
    updateCounsellorSettings,
    subscribeToAuthor,
    subscribeToCategory,
    subscribeToContent,
    purchaseContentDirect,
    createAccount,
    requestPayout,
    linkDevice
}
