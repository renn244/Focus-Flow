import { randomBytes } from "crypto"

const generateToken = (length: number=32): string => {
    return randomBytes(length).toString('hex');
}

export default generateToken;