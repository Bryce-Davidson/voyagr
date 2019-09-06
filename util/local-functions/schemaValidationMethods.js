module.exports = {
    isOwner: function (instance, incomingUser) {
        if(instance.user) return instance.user == incomingUser
        else              return instance == incomingUser;
    },
    keysContainString(keyPart, obj) {
        for (var k in obj)
            return ~k.indexOf(keyPart);
    }
}