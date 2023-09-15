import requests
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
import geopandas as gpd
import os
import matplotlib.pyplot as plt

# Austria, Bulgaria, the Czech Republic, Hungary, Poland, Romania, Slovakia, Slovenia, Liechtenstein, and Switzerland
country_list = ['Austria', 'Bulgaria', 'Czech-Republic', 'Hungary', 'Liechtenstein', 'Poland', 'Romania', 'Slovakia', 'Slovenia', 'Switzerland']

meeting_keywords = ['Call','Travel',"Meet","Visit"]

def get_collection_links(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Check for any errors in the response

        soup = BeautifulSoup(response.content, 'html.parser')
        list_items = soup.find_all('li', class_='collection-result') 
        # add in boolean if its a readout
        # (Event_Name, Link, date, Is Meeting/Readout)
        results_df = pd.DataFrame(columns=['Event Name','Date','Link','Is Meeting'])
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
            results_df.loc[len(results_df)] = (Event_Name,Date,Link,Is_meeting)
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
    groups = df[is_meeting].groupby('Country').size()
    grouped_df = pd.DataFrame({'Country': groups.index, 'Value': groups.values})
    grouped_df['Country']=grouped_df['Country'].replace(to_replace='Czech-Republic', value='Czech Republic')
    # grouped_df['Value'] = (grouped_df['Value']- np.min(grouped_df['Value']))/(np.max(grouped_df['Value']) - np.min(grouped_df['Value']))
    geojson_folder = r'C:\Users\olove\Documents\state_coding\geoJson'
    # Initialize an empty list to store GeoDataFrames
    gdf_list = []

    # Iterate over each file in the folder
    for filename in os.listdir(geojson_folder):
        if filename.endswith(".geojson"):  # Check if the file is a GeoJSON file
            file_path = os.path.join(geojson_folder, filename)
            
            # Read the GeoJSON file and append it to the list
            gdf_list.append(gpd.read_file(file_path))

    # Concatenate all GeoDataFrames in the list into one
    final_gdf = gpd.GeoDataFrame(pd.concat(gdf_list, ignore_index=True), crs=gdf_list[0].crs)
    merged = final_gdf.merge(grouped_df, left_on='ADMIN', right_on='Country', how='left')
    # Plot the GeoDataFrame with a colormap based on the 'Value' column
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    merged.plot(column='Value', cmap='YlOrRd', linewidth=0.8, ax=ax, edgecolor='0.8', legend=True)

    # Set axis labels and title
    ax.set_title('Visits Heatmap')
    ax.set_axis_off()

    # Show the plot
    plt.show()