# Import necessary packages
import requests
from bs4 import BeautifulSoup
import pandas as pd
import random
# Austria, Bulgaria, the Czech Republic, Hungary, Poland, Romania, Slovakia, Slovenia, Liechtenstein, and Switzerland
# Create a list for the above CE countries
country_list = ['Austria', 'Bulgaria', 'Czech-Republic', 'Hungary', 'Liechtenstein', 'Poland', 'Romania', 'Slovakia', 'Slovenia', 'Switzerland']

# keywords to find and use to distinguish different meeting types
meeting_keywords = ['Call','Travel',"Meet","Visit"]

user_agents = [ #trying to obscure our identity ever so slightly :)
    # Google Chrome on Windows 10
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
    # Mozilla Firefox on Windows 10
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0",
    # Safari on macOS
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Safari/605.1.15",
    # Microsoft Edge on Windows 10
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36 Edg/97.0.1072.76",
    # Opera on Windows 10
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36 OPR/85.0.4258.55",
    # Google Chrome on Android
    "Mozilla/5.0 (Linux; Android 11; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36",
    # Safari on iOS
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile/15E148 Safari/604.1"
]
# use above as a header in a request
# headers = {"User-Agent": random.choice(user_agents)}
# requests.get(url, headers=headers)

# Define the primary function to be used for this script
def get_collection_links(url):
    # this function will get a collection of articles given a certain url
    try: #the try except structure is used in case a timeout or request error is returned
        headers = {"User-Agent": random.choice(user_agents)}
        response = requests.get(url,headers=headers) # call the url
        response.raise_for_status()  # Check for any errors in the response

        soup = BeautifulSoup(response.content, 'html.parser') # beautiful soup is a package that turns an html reponse into a python object(s)

        list_items = soup.find_all('li', class_='collection-result') 
        # in current state.gov website html structure the articles are stored in a "li" (a bullet point/item in an html list) that has class 'collection-result'
        # note: if this script breaks/no longer pulls data it is likely because state.gov changes its website html and this code needs to be updated

        results_df = pd.DataFrame(columns=['Event Name','Date','Link','Is Meeting']) #instantiate a dataframe object with these columns
        
        for item in list_items: # for each item in the li list do below
            Event_Name = item.find('a').text.strip() #find the hyperlink (aka 'a' tag) in each item and get the text of the hyperlink
            Link = item.find('a')['href'] # grab the link/underlying url that the hyperlink directs to (in html this is stored in the attribute 'href')

            if item.find('div', class_='collection-result-meta').find('span', attrs={'dir': 'ltr'}):
                # this looks for a 'div' tag in the list item that has class 'collection-result-meta'
                # then it searches in the div for a span with the attribute 'dir'= 'ltr'
                # if it finds such a span then it goes to the below line where it takes the text of that span and sets that as date
                # this seems complex, but is the easiest way to extract the date based on the state.gov html structure.
                Date = item.find('div', class_='collection-result-meta').find('span', attrs={'dir': 'ltr'}).text.strip()
            else:
                Date = None
            
            if item.find('p'): # this searches for a 'p' (paragraph) tag in the pulled list item 
                Is_meeting = 'Readout' in item.find('p').text 
                #in the state.gov website meetings and events 
                # we wanted to capture were always tagged with 'Readout' 
                # this code finds the word 'Readout' in paragraph ('p' tag) in the item and if readout is then meeting is set to True. otherwise 
            else: # if there is no 'p' tag then this is not an event
                Is_meeting = False


            results_df.loc[len(results_df)] = (Event_Name,Date,Link,Is_meeting) #add the data we found for this event to the bottom of the dataframe
        return results_df # return the dataframe 
    except requests.exceptions.RequestException as e:
        print("Error occurred during the request:", e)
        return []

if __name__ == "__main__": # this is python convention for a main method, ignore it is not strictly necessary.
    df = pd.DataFrame() #instantiate a new dataframe
    target_num = 100 #number of events to pull from each country
    for country in country_list:
        url = r'https://www.state.gov/countries-areas-archive/'+country+r'/' + '?results=' + str(target_num) # create a url that returns the list of events for x country
        events_df = get_collection_links(url) # call the above explained function
        if events_df.shape[0] <1: # if there less than 1 events in the returned dataframe
            print(f"No travel links found at {url}")
        events_df['Country'] = country # add a column to the dataframe that is the name of the country that these events were pulled for.
        # print(country_df) 
        df = pd.concat([df,events_df], ignore_index=True) # combine the dataframes together

    # df['Is Meeting'] = False
    mask = df.apply(lambda row: any(keyword in row['Event Name'] for keyword in meeting_keywords), axis=1) 
    # See if any keyword was in the Event Title for each event. This is used for marking what type of meeting each meeting is
    df.loc[mask,'Is Meeting'] = True 
    #this applys a mask so that any event that was true (meaning had a meeting keyword in its title) is marked as true 
    # in the 'Is Meeting' column in the dataframe
    #print(df)
    df.to_csv('Events.csv', encoding='utf-8-sig',index=False)
        