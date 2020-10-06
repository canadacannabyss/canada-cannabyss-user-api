module.exports = (order) => `
  <div style='width: 100%; height: 100%; background-color: #fff'>
    <div style='width: 90%; display: table; margin: 30px auto 0 auto'>
      <div style='display: flex; flex-direction: row'>
        <img 
          src='https://canada-cannabyss.s3.ca-central-1.amazonaws.com/assets/logo/canada-cannabyss-logo.png'
          alt='Canada Cannabyss logo'
          title='Canada Cannabyss'
          style='height: 60px; width: 60px;'
        />
        <h1 style='color: #18840f; font-weight: 100; margin-left: 5px;'>Order Tracking Number | Canada Cannabyss</h1>
      </div>
      <br />
      <br />
      <p style='color: rgb(119, 119, 119); font-size: 16px; margin-bottom: 0.5rem;'>Order was successfully placed shipped to you.</p>
      <p style='color: rgb(119, 119, 119); font-size: 16px; margin-bottom: 0.5rem;'>You can track out package following these next steps:</p>
      <h2 style='color: #18840f; font-size: 16px; margin-bottom: 0.5rem;'>Order ID</h2>
      <span style='color: #1b1b1b; font-size: 18px; margin-bottom: 0.5rem;'>${order._id}</span>
      <h2 style='color: #18840f; font-size: 16px; margin-bottom: 0.5rem;'>Tracking Number</h2>
      <span style='color: #1b1b1b; font-size: 18px; margin-bottom: 0.5rem;'>${order.tracking.number}</span>
      <h2 style='color: #18840f; font-size: 16px; margin-bottom: 0.5rem;'>Postal Service</h2>
      <span style='color: #1b1b1b; font-size: 18px; margin-bottom: 0.5rem;'>${order.tracking.postalService.name}</span>
      <h2 style='color: #18840f; font-size: 16px; margin-bottom: 0.5rem;'>Postal Service Tracking Website</h2>
      <a href='${order.tracking.postalService.trackingWebsite}' target='_blank' style='color: #18840f; font-size: 18px; text-decoration: none; line-height: 1.5;'>${order.tracking.postalService.trackingWebsite}</a>
      <br />
      <br />
      <p style='color: rgb(119, 119, 119); font-size: 13px;'>With ❤️ Canada Cannabyss Team</p>
    </div>
  </div>
`;