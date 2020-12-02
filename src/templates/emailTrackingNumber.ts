import { IOrder } from '../interfaces/templates/emailSender'

export default (order: IOrder) => `
  <div style='width: 100%; height: 100%; background-color: #fff'>
    <div style='width: 90%; display: table; margin: 30px auto 0 auto'>
      <div style='display: flex; flex-direction: row'>
        <img 
          src='https://canada-cannabyss.s3.ca-central-1.amazonaws.com/assets/logo/canada-cannabyss-logo.png'
          alt='Canada Cannabyss logo'
          title='Canada Cannabyss'
          style='height: 60px; width: 60px;'
        />
        <h1 style='color: #18840f; font-weight: 100; margin-left: 5px;'>Order was shipped | Canada Cannabyss</h1>
      </div>
      <br />
      <br />
      <p style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>Your order was successfully shipped to you and it will arrive within 2 or 3 business days through Canada Express Post.</p>
      <p style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>Thank you to buy with us we hope to you again soon.</p>
      <br />
      <br />
      <p style='color: #1b1b1b; font-size: 13px;'>With 💚 Canada Cannabyss Team</p>
    </div>
  </div>
`
