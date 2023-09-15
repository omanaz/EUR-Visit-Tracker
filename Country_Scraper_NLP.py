import requests
from bs4 import BeautifulSoup
import pandas as pd
import spacy

# Load the spaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Austria, Bulgaria, the Czech Republic, Hungary, Poland, Romania, Slovakia, Slovenia, Liechtenstein, and Switzerland
country_list = ['Austria', 'Bulgaria', 'Czech-Republic', 'Hungary', 'Liechtenstein', 'Poland', 'Romania', 'Slovakia', 'Slovenia', 'Switzerland']

meeting_keywords = ['Call','Travel',"Meet","Visit"]

def get_collection_links(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Check for any errors in the response

        soup = BeautifulSoup(response.content, 'html.parser')
        list_items = soup.find_all('li', class_='collection-result') 
        # (Event_Name, Link, date, Is Meeting/Readout)
        results_df = pd.DataFrame(columns=['Event Name','Date','Link','Is Meeting','First Participant','Other Participants'])
        for item in list_items:
            Event_Name = item.find('a').text.strip()
            Link = item.find('a')['href']
            if item.find('div', class_='collection-result-meta').find('span', attrs={'dir': 'ltr'}):
                Date = item.find('div', class_='collection-result-meta').find('span', attrs={'dir': 'ltr'}).text.strip()
            else:
                Date = None
            if item.find('p'):
                Is_meeting = 'Readout' in item.find('p').text
            else:
                Is_meeting = False

            doc = nlp(Event_Name)
        
            # Extract entities recognized as people's names
            people_names = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
            
            # Assuming there are two groups, split the names into two
            if len(people_names) >= 2:
                results_df.loc[len(results_df)] = (Event_Name,Date,Link,Is_meeting,people_names[0],', '.join(people_names[1:]))
            else:
                results_df.loc[len(results_df)] = (Event_Name,Date,Link,Is_meeting,None,None)

        return results_df
    
    except requests.exceptions.RequestException as e:
        print("Error occurred during the request:", e)
        return []

if __name__ == "__main__":
    df = pd.DataFrame()
    target_num = 100
    for country in country_list:
        url = r'https://www.state.gov/countries-areas-archive/'+country+r'/' + '?results=' + str(target_num)
        events_df = get_collection_links(url)
        if events_df.shape[0] <1:
            print(f"No travel links found at {url}")
        events_df['Country'] = country
        # print(country_df)
        df = pd.concat([df,events_df], ignore_index=True)

    # df['Is Meeting'] = False
    mask = df.apply(lambda row: any(keyword in row['Event Name'] for keyword in meeting_keywords), axis=1)
    df.loc[mask,'Is Meeting'] = True
    is_meeting = df['Is Meeting']
    meeting_df = df.loc[is_meeting]
    # print(meeting_df)
    df.to_csv('EventsNLP.csv', encoding='utf-8-sig',index=False)
