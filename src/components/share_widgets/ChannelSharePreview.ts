export const generateChannelShareHTML = (
  channelName: string,
  channelSubtitle: string,
  channelImageUrl: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${channelName}</title>
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${channelName}" />
    <meta property="og:description" content="${channelSubtitle}" />
    <meta property="og:image" content="${channelImageUrl}" />
    <meta property="og:type" content="website" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${channelName}" />
    <meta name="twitter:description" content="${channelSubtitle}" />
    <meta name="twitter:image" content="${channelImageUrl}" />
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #000;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .card {
            background-color: #1a1a1a;
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .avatar {
            width: 120px;
            height: 120px;
            border-radius: 60px;
            object-fit: cover;
            margin-bottom: 16px;
            border: 4px solid #333;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 8px 0;
        }
        .subtitle {
            font-size: 16px;
            color: #888;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="card">
        <img src="${channelImageUrl}" alt="Channel Image" class="avatar" />
        <h1 class="title">${channelName}</h1>
        <p class="subtitle">${channelSubtitle}</p>
    </div>
</body>
</html>
  `.trim();
};
