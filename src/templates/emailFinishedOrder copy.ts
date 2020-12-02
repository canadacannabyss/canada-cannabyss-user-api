export default (order: { _id: string }) => `
  <div style='width: 100%; height: 100%; background-color: #fff'>
    <div style='width: 90%; display: table; margin: 30px auto 0 auto'>
      <div style='display: flex; flex-direction: row'>
        <img 
          src='https://canada-cannabyss.s3.ca-central-1.amazonaws.com/assets/logo/canada-cannabyss-logo.png'
          alt='Canada Cannabyss logo'
          title='Canada Cannabyss'
          style='height: 60px; width: 60px;'
        />
        <h1 style='color: #18840f; font-weight: 100; margin-left: 5px;'>Your order was successfully placed | Canada Cannabyss</h1>
      </div>
      <br />
      <br />
      <p style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>Order was successfully placed and the payment is yet to be verified.</p>
      <p style='color: #1b1b1b; font-size: 16px; margin-bottom: 0.5rem;'>Once the payment proccessed and verified your package will be deliveried to you along the required information to tracking it.</p>
      
      <h2 style='color: #18840f; font-size: 16px; margin-bottom: 0.5rem;'>Order ID</h2>
      <span style='color: #1b1b1b; font-size: 18px; margin-bottom: 0.5rem;'>${order._id}</span>
      <h2 style='color: #18840f; font-size: 16px; margin-bottom: 0.5rem;'>Check your order details on</h2>
      <a href='${process.env.FRONTEND_URL}/account/orders' target='_blank' style='color: #18840f; font-size: 18px; text-decoration: none; line-height: 1.5; word-break: break-all;'>${process.env.FRONTEND_URL}/account/orders</a>
      <br />
      <br />
      <p style='color: #1b1b1b; font-size: 13px;'>With 💚 Canada Cannabyss Team</p>
    </div>
  </div>
`
