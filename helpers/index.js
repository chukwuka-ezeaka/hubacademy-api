const moment = require("moment");

const paginate = ({ page, limit }) => {

    const offset = page * limit;

    return {
        offset,
        limit:parseInt(limit),
    };
};


const transactionStatus = {
    STARTED: 'STARTED',
    PENDING: 'PENDING',
    FAILED: 'FAILED',
    COMPLETED: 'COMPLETED',
    INCOMPLETE: 'INCOMPLETE',
}

const walletStatus = {
    DEPOSIT: 'deposit',
    WITHDRAW: 'withdraw',
}

const getSubscriptionExpiry = (interval)=>{
    let expiry = null;
    switch (interval) {
        case 'daily':
            expiry = moment().add(1,'day').format('YYYY-MM-D h:m:s');
            break;
        case 'weekly':
            expiry = moment().add(1,'week').format('YYYY-MM-D h:m:s');
            break;
        case 'semi_weekly':
            expiry = moment().add(2,'weeks').format('YYYY-MM-D h:m:s');
            break;
        case 'monthly':
            expiry = moment().add(1,'month').format('YYYY-MM-D h:m:s');
            break;
        case 'semi_monthly':
            expiry = moment().add(2,'months').format('YYYY-MM-D h:m:s');
            break;
        case 'quarterly':
            expiry = moment().add(3,'months').format('YYYY-MM-D h:m:s');
            break;
        case 'biyearly':
            expiry = moment().add(6,'months').format('YYYY-MM-D h:m:s');
            break;
        case 'yearly':
            expiry = moment().add(1,'year').format('YYYY-MM-D h:m:s');
            break;
        default:
            expiry = null;
    }
    return expiry;
}


module.exports = {paginate,transactionStatus,getSubscriptionExpiry,walletStatus}
