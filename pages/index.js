import { SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Layout, Menu, Space, Table } from 'antd';
import Head from 'next/head';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Salary from '../components/Salary';
import Stats from '../components/Stats';
import useData from '../hooks/useData';
import { ITEMS_PER_PAGE, SITE_NAME } from '../lib/constants';
import { filterSorter, getFiltersForKey, round } from '../lib/helpers';

const { Header, Content } = Layout;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const HomePage = () => {
  const [data, loading, error] = useData();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [filters, setFilters] = useState();

  useEffect(() => {
    if (!loading && !error) {
      setListings(data);
      setFilteredListings(data);
    }
  }, [data]);

  // Filters state
  const isFiltered = useMemo(() => {
    if (!filters) {
      return false;
    }

    return Object.values(filters).some(filterValue => Boolean(filterValue));
  }, [filters]);

  // Company filter
  const companyFilters = useMemo(
    () =>
      getFiltersForKey(
        listings.map(i => i.company),
        'name',
      ).sort(filterSorter),
    [listings],
  );

  // Location filter
  const locationFilters = useMemo(
    () => getFiltersForKey(listings, 'location').sort(filterSorter),
    [listings],
  );

  // Search filter
  const searchInput = useRef(null);
  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current.select());
      }
    },
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => confirm();

  const handleReset = clearFilters => clearFilters();

  // Columns
  const columns = useMemo(
    () => [
      {
        title: 'Date',
        dataIndex: 'date',
        responsive: ['lg'],
        width: 120,
      },
      {
        title: 'Company',
        dataIndex: ['company', 'name'],
        responsive: ['md', 'lg'],
        width: 280,
        filters: companyFilters,
        filterMultiple: true,
        onFilter: (value, record) => record.company.name === value,
        render: (companyName, record) => (
          <a href={record.company.url}>{companyName}</a>
        ),
      },
      {
        title: 'Title',
        dataIndex: 'title',
        render: (title, record) => <a href={record.url}>{title}</a>,
        ...getColumnSearchProps('title'),
      },
      {
        title: 'Location',
        dataIndex: 'location',
        responsive: ['lg'],
        width: 160,
        filters: locationFilters,
        filterMultiple: true,
        onFilter: (value, record) => record.location === value,
      },
      {
        title: 'Salary (net)',
        dataIndex: 'salary',
        width: 160,
        sorter: (a, b) => a.salary.range[0] - b.salary.range[0],
        render: salary => <Salary {...salary} />,
      },
    ],
    [listings],
  );

  // Chart
  const chartData = useMemo(
    () =>
      filteredListings
        .map(listing => {
          const range = listing.salary.range;

          if (range[1]) {
            return round((range[0] + range[1]) / 2);
          }

          return round(range[0]);
        })
        .reduce(
          (acc, cur) => {
            const band = Math.floor(cur / 1000);

            if (acc[band]) {
              acc[band]++;
            } else {
              acc[band] = 1;
            }

            return acc;
          },
          {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
            12: 0,
          },
        ),
    [filteredListings],
  );
  const labels = useMemo(
    () =>
      Object.keys(chartData).map((band, index) => {
        band = parseInt(band);

        return `${1000 * band}-${band * 1000 + 999}`;
      }),
    [chartData],
  );

  if (error) {
    return (
      <Alert
        message="A server error has occurred"
        description="Please refresh the page to try again."
        type="error"
        showIcon={true}
      />
    );
  }

  return (
    <>
      <Head>
        <title>{SITE_NAME}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Header>
          <div
            style={{
              float: 'left',
              marginRight: 24,
              fontWeight: 600,
              fontSize: 21,
              color: 'white',
            }}
          >
            {SITE_NAME}
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['Home']}
            items={[{ key: 'Home', label: 'Home' }]}
          />
        </Header>
        <Content style={{ maxWidth: 1140, margin: '0 auto' }}>
          <Stats
            data={filteredListings}
            loading={loading}
            isFiltered={isFiltered}
          />
          <Table
            tableLayout="fixed"
            dataSource={listings}
            columns={columns}
            loading={loading}
            pagination={{
              pageSize: ITEMS_PER_PAGE,
              position: ['bottomLeft'],
              showSizeChanger: false,
            }}
            onChange={(pagination, filters, sorter, extra) => {
              setFilters(filters);
              setFilteredListings(extra.currentDataSource);
            }}
          />
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: '# of jobs',
                  data: Object.values(chartData),
                },
              ],
            }}
          />
        </Content>
      </Layout>
    </>
  );
};

export default HomePage;
