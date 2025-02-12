type Platform ='windows' |'macOS' |'ios' |'android' |'Ubuntu' |'other' |'ipad' | undefined


export const getPlatform = (): Platform => {

    const u = navigator.userAgent

    if (!!u.match(/compatible/i) || u.match(/Windows/i)) {
        return 'windows'
    } else if (!!u.match(/Macintosh/i) || u.match(/MacIntel/i)) {
        return 'macOS'
    } else if (u.match(/iphone/i)) {
        return 'ios'
    } else if (u.match(/android/i)) {
        return 'android'
    } else if (u.match(/Ubuntu/i)) {
        return 'Ubuntu'
    } else if (u.match(/ipad/i)) {
        return 'ipad'
    } else {
        return 'other'
    }
}

type Dimension = {
    /** width */
    width: number,
    height: number
}
export const getDimension = (): Dimension => {

    return {
        width: document.body.clientWidth,
        height: document.body.clientHeight
    }

}

export {
    Dimension,
    Platform
}
