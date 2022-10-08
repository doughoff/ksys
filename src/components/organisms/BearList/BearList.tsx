import useBearStore from '~/stores/bearStore';

const BearList = () => {
  const { bears } = useBearStore();
  return (
    <ul>
      {bears.map((bear) => (
        <li key={bear.id}>{bear.name}</li>
      ))}
    </ul>
  );
};

export default BearList;
