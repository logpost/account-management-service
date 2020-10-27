import bcrypt from 'bcrypt'

const hashing = async (plaintext) => {
	const hash = await bcrypt.hash(plaintext, 11)
	return hash
}

const compareHashed = async (plaintext, hashed) => {
	const match = await bcrypt.compare(plaintext, hashed);
    return match
}

export { 
	hashing,
	compareHashed
}