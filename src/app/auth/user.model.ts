export class User {
    constructor(
        public id: string,
        public email: string,
        // tslint:disable-next-line: variable-name
        private _token: string,
        private tokenExpirationDate: Date
    ) {}
    public get token(): string {
        if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
            return null;
        }
        return this._token;
    }
}
