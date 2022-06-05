const nodemailer = require('nodemailer');

class MailService
{
    constructor()
    {
        this.transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            port: process.env.smtp_port,
            auth: {
                user: "chosterjpg@outlook.com",
                pass: "Makar21062002"
            }
        })
    }

    async sendActivationMail(to, link)
    {
        await this.transporter.sendMail({
            from: "chosterjpg@outlook.com",
            to: to,
            subject: "Активация аккаунта в приложении " + process.env.API_URL,
            text: '',
            html:
            `
                <div>
                    <h1>
                        Для активации перейдите по ссылке: 
                    </h1>
                    <br>
                    <a href="${link}">${link}</a>
                </div>
            `
        })
    }

    async sendResetMail(to, link, tmpPass)
    {
        await this.transporter.sendMail({
            from: "chosterjpg@outlook.com",
            to: to,
            subject: "Смена пароля в приложении " + process.env.API_URL,
            text: '',
            html:
                `
                <div>
                    <h1>
                        Для смены пароля перейдите по ссылке: 
                    </h1>
                    <br>
                    <a href="${link}">${link}</a>
                    <br>
                    <h3>
                        Временный пароль:
                    </h3>
                    <br>
                    <b>${tmpPass}</b>
                </div>
            `
        })
    }
}

module.exports = new MailService();