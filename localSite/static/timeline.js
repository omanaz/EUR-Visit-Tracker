const csvData = localStorage.getItem('csvData');
const rows = d3.csvParse(csvData);
const timelineDiv = d3.select('#timeline');

let visibleRows = 0;
const rowsPerPage = 12;

function createTimelineElement(eventName, date, isEven, country, link) {
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
    console.log(link);
    containerElement.select('.content')
        .append('p')
        .append('a')
        .attr('href', link)
        .attr('target', '_blank')  // Open link in a new tab/window
        .text(eventName);
    const imgElement = containerElement.append('img')
        .classed('country-image', true)
        .attr('src', `static/images/${country}Flag.png`);

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

        createTimelineElement(eventName, date, isEven, row['Country'], row['Link']);
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

// Add scroll event listener and show/hide goto top
document.addEventListener('DOMContentLoaded', function () {
    const goToTopBtn = document.getElementById('goToTopBtn');
    const sidebar = document.getElementById('sidebar'); 

    // Show/hide button and adjust sidebar height based on scroll position
    window.onscroll = function () {

        // Check scroll position for the "go to top" button and sidebar height
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            goToTopBtn.style.display = 'block';
            sidebar.style.height = '17vh';
        } else {
            goToTopBtn.style.display = 'none';
            sidebar.style.height = '12vh';
        }

        // Check if the user has scrolled to the bottom for loading more content
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1) {
            loadMoreTimeline();
        }
    };
});

// handle goto

// Function to find the most recent event for a specific country
function findLatestEventForCountry(country) {
    // Assuming rows is your CSV data
    const eventsForCountry = rows.filter(row => row['Country'].trim() === country.trim());
    
    if (eventsForCountry.length > 0) {
        // Sort events by date in descending order
        eventsForCountry.sort((a, b) => new Date(b['Date']) - new Date(a['Date']));
        return eventsForCountry[0];
    } else {
        return null;
    }
}

// Function to scroll to the timeline element of the selected country
function scrollToLatestEvent(country) {
    const latestEvent = findLatestEventForCountry(country);

    if (latestEvent) {
        // Load all events (you may need to modify this part based on how you load events)
        // Assuming rows is your CSV data
        // ...

        // Find the index of the latest event
        const index = rows.findIndex(row => row === latestEvent);

        // If the event is found, scroll to its timeline element
        if (index !== -1) {
            const timelineElements = document.querySelectorAll('.timeline');
            const targetTimelineElement = timelineElements[index];
            console.log(targetTimelineElement);
            if (targetTimelineElement) {
                // Scroll to the target element
                targetTimelineElement.scrollIntoView({ behavior: 'smooth' });
            } else{
                loadMoreTimeline();
                scrollToLatestEvent(country);
            }
        }
    }
}
const goToLatestButton = document.querySelector('#sidebar button');

// Event listener for the "Go To Latest" button
goToLatestButton.addEventListener('click', () => {
    const selectedCountry = document.getElementById('countrySelect').value;
    scrollToLatestEvent(selectedCountry);
});


// Goto top button

function goToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add an event listener to show/hide the button based on the scroll position
// document.addEventListener('DOMContentLoaded', function () {
//     const goToTopBtn = document.getElementById('goToTopBtn');
//     const sidebar = document.getElementById('sidebar'); 
//     // Show/hide button based on scroll position
//     window.onscroll = function () {
//         if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
//             goToTopBtn.style.display = 'block';
//             sidebar.style.height = '17vh';
//         } else {
//             goToTopBtn.style.display = 'none';
//             sidebar.style.height = '12vh';

//         }
//     };
// });