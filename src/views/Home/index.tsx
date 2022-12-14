import React, { useEffect, useState } from 'react';

import Select from 'components/Select';
import Table from 'components/Table';
import TextInput from 'components/Input';
import { fetchCharacterDataFromApi } from 'utils/api';

import styles from './styles.module.scss';

type CharacterType = {
  [key: string]: any;
};

const Home = () => {
  const [characterData, setCharacterData] = useState<CharacterType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limits, setLimits] = useState(10);
  const [cultureFilterReference, setCultureFilterReference] = useState('');
  const [genderFilterReference, setGenderFilterReference] = useState('Any');

  /* Fetch data from api
   *  Endpoint https://anapioficeandfire.com/api/characters
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await fetchCharacterDataFromApi(currentPage, limits);
        setCharacterData(
          data.map((item: { [key: string]: any }) => {
            const name = item.name + item.aliases.length > 0 && item.name !== '' ? ', ' : '' + item.aliases.join(', ');

            let alive = '';
            const born = item.born.match(/\d+/g);
            const died = item.died.match(/\d+/g);

            if (item.born === '' && item.died === '') {
              alive = 'Unknown';
            } else if (item.died !== '') {
              if (born !== null && died != null) {
                const from = Math.min(...died) - Math.max(...born);
                const to = Math.max(...died) - Math.min(...born);
                alive = `No, died at ${from === to ? from : `${from} to ${to}`} years old`;
              } else {
                alive = 'No';
              }
            } else if (item.born === '') {
              alive = 'No';
            } else alive = 'Yes';

            return {
              character: name,
              alive: alive,
              gender: item?.gender,
              culture: item?.culture ? item?.culture : 'Unknown',
              allegiances: item.allegiances,
            };
          })
        );
      } catch (error) {}
    };
    fetchData();
  }, [limits, currentPage]);

  /*
   *  Handle Culture Filter Input Box
   */
  const handleCultureFilterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCultureFilterReference(e.target.value);
  };

  /*
   *  Handle Gender Filter Select Option
   */
  const handleGenderSelector = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenderFilterReference(e.target.value);
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Characters</h2>
      <div className={styles.filter}>
        <TextInput placeholder="Culture" onChange={handleCultureFilterInput} />
        <Select options={['Any', 'Male', 'Female']} setValue={handleGenderSelector} />
      </div>
      <Table
        data={characterData.filter(
          item =>
            (genderFilterReference !== 'Any' ? item?.gender === genderFilterReference : true) &&
            (cultureFilterReference !== '' ? item?.culture?.includes(cultureFilterReference) : true)
        )}
        currentPage={currentPage}
        limits={limits}
        setLimits={setLimits}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default Home;
