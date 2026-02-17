const utils = {
    fs : undefined,
    ReadJSON : (file_directory) => {
        const chatFile = utils.fs.readFileSync(file_directory)
        if (chatFile) {
            const chatData = JSON.parse(chatFile.toString())
            return chatData
        }
    },

    CheckUserPermitted : (ip, chatObject) => {
        const forcePermitted = chatObject.permitted_ips.length > 0
        const isPermitted = (chatObject.permitted_ips.find((permitted_ip) => permitted_ip === ip))
        const isBanned = (chatObject.banned_ips.find((banned_ip) => banned_ip === ip))
        return (!forcePermitted || isPermitted) && !isBanned
    }
}

export default utils