<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8"/>
    <link rel="icon" type="image/png" href="./favicon.png">
	<title>A11ygator - Accessibility report for "<%= data.documentTitle %>"</title>
</head>
<body>

	<div class="pa11y-report">
		<style><%= data.css %></style>

		<div class="pa11y-page">

            <div tabindex="0" class="report-title-container">
			    <h1>Accessibility report for <a href="<%= data.pageUrl %>" target="_blank"><%= data.documentTitle %></a></h1>
                <a class="download-report" aria-label="download report" href="data:text/json;charset=utf-8,<%= encodeURIComponent(JSON.stringify(data)) %>" download="report.json">Download</a>
            </div>

			<% if (data.screenPath) { %>
			<div class="screenshot-container">
				<div class="buttons-container">
					<div class="button-osx close"></div>
					<div class="button-osx minimize"></div>
					<div class="button-osx zoom"></div>
				</div>
				<img alt="a screenshot of the tested web page" class="screenshot" src="<%= data.screenPath %>"/>
			</div>
			<% } %>

			<ul class="results-list">
				<%
				var issues = data.issues
					.slice(0)
					.sort((issue1, issue2) => {
						if (issue1.typeCode !== issue2.typeCode) {
							return parseFloat(issue1.typeCode) - parseFloat(issue2.typeCode);
						}
						return 0;
					});

                if (data.issues.length === 0) { %>
                     <h1 tabindex="0">🎉Hurray! I have found no problems with your website. Now you are ready for a <b>real</b> accessibility test by human beings!</h1>
                <% }

				for (let i = 0; i < issues.length; i++) {
					let issue = issues[i]; %>
				<li tabindex="0" class="result <%= issue.type %>" data-selector="<%= issue.selector %>">
					<h2 tabindex="0" class="issue-title"><%= issue.message.replace(/</g, '&lt;').replace(/>/g, '&gt;') %></h2>
					<p tabindex="0" class="issue-rule"><%= issue.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') %></p>
					<pre tabindex="0"class="issue-code"><code><%= (issue.context || '').replace(/</g, '&lt;').replace(/>/g, '&gt;') %></code></pre>
				</li>
				<% } %>
			</ul>
			<hr />

			<footer>
				<p>Generated at: <%= data.date.toLocaleString() %></p>
				<div class="signature">
                    <a href="https://chialab.it" target="blank" aria-label="Made with love by ChiaLab">
                        <span>Made with ❤️ by Chialab </span>
                        <svg class="site-header__logo" viewBox="0 0 49 31" width="64" height="40" xmlns="http://www.w3.org/2000/svg">
                            <path d="M47 15.76h-2.62c-1.34 0-1.73-1.1-2.92-2.43s-6.6-6.42-16.28-6.42c-10.25 0-15.09 4.17-16.55 5.32-.436.39-.94.696-1.49.9-.67.21-1.25-.25-2.22-2.17C3.604 8.178 2.85 5.164 2.7 2.09 2.61.93 2.27.59 1.79.5 1.12.38.48.59.45 1.89c.08 3.633.986 7.2 2.65 10.43 1.37 2.31 1.55 2.8 1.55 3.38 0 .58-.18 1.06-1.55 3.38C1.437 22.31.53 25.877.45 29.51c0 1.31.67 1.52 1.34 1.4.49-.09.82-.43.91-1.58.15-3.068.904-6.075 2.22-8.85 1-1.92 1.55-2.34 2.22-2.13.557.234 1.063.573 1.49 1 1.46 1.16 6.3 5.48 16.55 5.48 9.67 0 15.06-4.26 16.28-5.66 1.22-1.4 1.58-1.37 2.92-1.37H47c.88 0 1.49-.18 1.49-1 0-.82-.65-1.04-1.49-1.04zm-8.43 2.63c-.33.82-5.45 4.34-13.14 4.34-9.25 0-14.6-4-16.21-5.92-.274-.285-.428-.665-.43-1.06.005-.377.16-.737.43-1 1.61-1.92 7-5.82 16.21-5.82 7.7 0 12.81 4.34 13.14 5.17.127.355.088.748-.106 1.07-.193.325-.52.544-.894.6H34c-1 0-1.52-1.28-2.25-2.19-.84-1.446-2.333-2.39-4-2.53-1.307-.046-2.576.44-3.52 1.346-.94.907-1.475 2.156-1.48 3.464.005 1.314.537 2.57 1.477 3.488.94.917 2.21 1.42 3.523 1.392 1.55.16 3.07-.51 4-1.76.488-.77 1.34-1.23 2.25-1.22h3.56c.73 0 1.25-.07.97.63h.04zm-8.28-2.69c0 1.414-1.146 2.56-2.56 2.56-1.414 0-2.56-1.146-2.56-2.56 0-1.414 1.146-2.56 2.56-2.56 1.4.022 2.525 1.16 2.53 2.56h.03z" fill="#F39200" fill-rule="evenodd">
                            </path>
                        </svg>
                    </a>
                </div>
			</footer>
		</div>
	</div>
</body>
</html>
