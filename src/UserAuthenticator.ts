export class UserAuthenticator​​ {

	exceptedUsername: string;
	expectedPassword: string

	constructor(exceptedUsername: string, expectedPassword: string) {
		this.exceptedUsername = exceptedUsername;
		this.expectedPassword = expectedPassword;
	}

	isValidAuthentication(username: string, password: string) {
		return ((username === this.exceptedUsername) && (password === this.expectedPassword));
	}

	static fromConfig() {
		const expectedUsername = process.env.USERNAME;
		const expectedPassword = process.env.PASSWORD;
		if ((expectedUsername !== undefined) && (expectedPassword !== undefined)) {
			return new UserAuthenticator(expectedUsername, expectedPassword);
		} else {
			return undefined;
		}
	}
}