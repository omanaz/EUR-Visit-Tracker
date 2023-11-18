const csvData = localStorage.getItem('csvData');
const rows = d3.csvParse(csvData);

const timelineDiv = d3.select('#timeline');

let visibleRows = 20;
const rowsPerPage = 12;

function createTimelineElement(eventName, date, isEven) {
    const timelineElement = timelineDiv.append('div')
        .classed('timeline', true);

    const containerElement = timelineElement.append('div')
        .classed('container', true)
        .classed('right', isEven)
        .classed('left', !isEven);

    containerElement.append('div')
        .classed('content', true)
        .append('h3')
        .text(date);

    containerElement.select('.content')
        .append('p')
        .text(eventName);
}

function loadMoreTimeline() {
    const totalRows = rows.length;

    for (let i = visibleRows; i < visibleRows + rowsPerPage && i < totalRows; i++) {
        const row = rows[i];
        let verb;
        if (row['Event Type'] === 'Meeting') {
        verb = 'meets';
        } else if (row['Event Type'] === 'Call') {
        verb = 'calls';
        } else if (row['Event Type'] === 'Visit') {
        verb = 'visits';
        } else{
            verb = row['Event Type'];
        }
        const eventName = row['Principal'].trim() +' '+ verb +' '+ row['Country'].trim();
        const date = row['Date'].trim();
        const isEven = i % 2 === 0;

        createTimelineElement(eventName, date, isEven);
    }

    visibleRows += rowsPerPage;
}

function deleteTopTimeline() {
    timelineDiv.selectAll('.timeline').filter((d, i) => i < rowsPerPage).remove();
}

// Sort rows by date
rows.sort((a, b) => d3.descending(new Date(a['Date']), new Date(b['Date'])));

// Initial load
loadMoreTimeline();

// Add scroll event listener
window.onscroll = function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight-1) {
        // User has scrolled to the bottom
        console.log('test');
        loadMoreTimeline();
        // deleteTopTimeline();
    }
};