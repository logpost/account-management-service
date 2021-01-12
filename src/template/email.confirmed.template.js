import config from "../config";

export default (receiver_name = "ลูกค้า", email = "", role = "", email_token = "") => {
    const confirmemail_url = `${config.app.base_url}/account/email/confirm/receive/success?email_token=${email_token}`;
    return `
    <div>
        <h3>ข้อความสำหรับการยืนยันตัวเพื่อสมัครสมาชิก LOGPOST Platform</h3>
        <p>เรียน คุณ ${receiver_name} (${email})</p>
        <p>ทาง Logpost ได้รับคำขอจากคุณในเรื่อง ยืนยันตัวตนของคุณ</p>
        <p>ในการสมัครบัญชีผู้ใช้${role === "shipper" ? "ผู้ส่งสินค้า" : "ผู้ให้บริการขนส่งสินค้า"}</p>
        <p>หากคุณได้ส่งคำขอนี้ กรุณากดเข้าลิ้ง (url) ด้านล่างเพื่อยืนยันอีเมล</p>
        <a href="${confirmemail_url}" target="_blank">กดที่นี่เพื่อยืนยันตัวตน</a>
        <p>ห้ามเปิดเผยรหัสนี้ไม่ว่าในกรณีใดๆทั้งสิ้น หากคุณไม่ได้ส่งคำขอ กรุณาละเว้นอีเมลฉบับนี้</p>
        <p>สำหรับความช่วยเหลือเพิ่มเติมกรุณาตรวจสอบ ศูนย์ให้ความช่วยเหลือของเรา หรือ ติดต่อฝ่ายบริการลูกค้า</p>
        <p>อีเมลนี้เป็นอีเมลอัตโนมัติ กรุณาอย่าตอบกลับ</p>
    </div>
`;
};
