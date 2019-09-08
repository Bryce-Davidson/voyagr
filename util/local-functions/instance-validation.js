module.exports = {
    isOwner: function (instance, incomingUser) {
        if (instance.user._id)      return instance.user._id == incomingUser;
        else                        return instance == incomingUser;
    },
    keysContainString(keyPart, obj) {
        for (var k in obj)
            return ~k.indexOf(keyPart);
    }
}