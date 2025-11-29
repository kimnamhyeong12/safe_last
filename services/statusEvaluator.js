const DEAD_THRESHOLD = 5;
const DANGER_THRESHOLD = 3;

function evaluateUserStatus(user) {
    if (typeof user.danger_level !== 'number') {
        user.danger_level = 0;
    }

    // danger_level 기준으로 상태 판단
    if (user.danger_level >= DEAD_THRESHOLD) {
        user.status = 'dead';
    } else if (user.danger_level >= DANGER_THRESHOLD) {
        user.status = 'danger';
    } else {
        user.status = 'normal';
    }

    return user;
}

module.exports = evaluateUserStatus;

