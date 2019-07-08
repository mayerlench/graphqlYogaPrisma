const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const R = require('ramda')
const { getUserId } = require('../utils')
const { APP_SECRET } = process.env

async function signup(parent, args, context, info) {
    const password = await bcrypt.hash(args.password, 10)
    const user = await context.prisma.createUser({ ...args, password })
    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}

async function login(parent, args, context, info) {
    const user = await context.prisma.user({ email: args.email })
    if (!user) {
        throw new Error('No such user found')
    }

    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
        throw new Error('Invalid password')
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}

const createLink = (parent, args, context) => {
    const userId = getUserId(context)
    console.log("TCL: createLink -> userId", userId)

    return context.prisma.createLink({
        url: args.url,
        description: args.description,
        postedBy: { connect: { id: userId } }
    })
}

const updateLink = (parent, args, context) => {
    return context.prisma.updateLink({
        where: { id: args.id },
        data: {
            url: args.url,
            description: args.description
        }
    })
}

const deleteLink = (parent, args) => {
    var link = R.find(R.propEq('id', args.id), links)
    links = links.filter(l => l.id !== args.id)
    return link
}

const vote = async (parent, args, context, info) => {
    const userId = getUserId(context)
    const linkExists = await context.prisma.$exists.vote({
        user: { id: userId },
        link: { id: args.linkId }
    })

    if (linkExists) 
        throw new Error(`Already voted for link: ${args.linkId}`)
    
    return context.prisma.createVote({
        user: { connect: { id: userId } },
        link: { connect: { id: args.linkId } }
    })
}

module.exports = {
    signup,
    login,
    createLink,
    updateLink,
    deleteLink,
    vote
}
