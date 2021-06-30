import { Section } from '../MDXLayout/shortcodes';
import { encodeAddress } from '@polkadot/util-crypto';
import {
  Box,
  Button,
  CheckBox,
  FormField,
  Grid,
  Image,
  Select,
  Spinner,
  Text,
  TextInput,
} from 'grommet';
import { Alert } from 'grommet-icons';
import { ConnectWalletButton } from '../ConnectWallet';
import React, { useEffect, useMemo, useState } from 'react';
import {
  isWeb3Injected,
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from '@polkadot/extension-dapp';
import { Success } from './Success';
import { ApiPromise, WsProvider } from '@polkadot/api';
import ksm_token_logo from '../../images/altair/ksm_token_logo.svg';

const KUSAMA_GENESIS_HASH =
  '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe';

export const Stake = () => {
  const [selectedAccount, setSelectedAccount] = useState({});
  const [disabled, setDisabled] = useState(true);
  const [ksmAmount, setKsmAmount] = useState('');
  const [checked, setChecked] = useState(false);
  const [isContributing, setIsContributing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [error, setError] = useState();
  const [hash, setHash] = useState();
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [accounts, setAccounts] = useState([]);
  const [freeBalance, setFreeBalance] = useState('');
  const [api, setApi] = useState();
  const [injector, setInjector] = useState();

  useEffect(
    () => {
      setBalanceLoading(true);
      (async () => {
        const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');

        const api = await ApiPromise.create({ provider: wsProvider });

        const web3Injector = await web3FromAddress(selectedAccount.address);

        setApi(api);
        setInjector(web3Injector);

        if (selectedAccount?.address) {
          const balances = await api.query.system.account(
            selectedAccount.address,
          );

          setFreeBalance(balances.data.free.toNumber().toString());
          setBalanceLoading(false);
        }
      })();
    },
    [selectedAccount],
  );

  const contribute = async () => {
    try {
      const extrinsic = api.tx.crowdloan.contribute(
        2007,
        parseFloat(ksmAmount) * 10 ** 12,
        null,
      );
      await extrinsic.signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        status => {
          setIsContributing(true);
          if (status.status.isFinalized) {
            setHash(extrinsic.hash.toHex());
            setIsFinalized(true);
            setIsContributing(false);
          }

          if (status.status.dispatchError) {
            setError(status.status.dispatchError);
            setIsFinalized(false);
            setIsContributing(false);
          }
        },
      );
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    (async () => {
      await web3Enable('Altair Auction');

      const allAccounts = await web3Accounts();

      const kusamaAccounts = allAccounts.filter(
        account => account.meta.genesisHash === KUSAMA_GENESIS_HASH,
      );

      setAccounts(kusamaAccounts);
      setSelectedAccount(kusamaAccounts[0]);
    })();
  }, []);

  const formattedFreeBalance = useMemo(
    () => `${freeBalance.slice(0, 1)}.${freeBalance.slice(1)}`,
    [freeBalance],
  );

  const isValidKsmAmount = useMemo(
    () => {
      if (
        /^\d*(\.\d+)?$/.test(ksmAmount) &&
        parseFloat(ksmAmount) >= 0.1 &&
        parseFloat(ksmAmount) <= parseFloat(formattedFreeBalance)
      ) {
        return true;
      }

      return false;
    },
    [formattedFreeBalance, ksmAmount],
  );

  useEffect(
    () => {
      if (ksmAmount && isValidKsmAmount && checked) {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    },
    [checked, ksmAmount],
  );

  const truncateAddress = address => {
    const encodedAddress = encodeAddress(address, 2);
    const firstFifteen = encodedAddress.slice(0, 15);
    const lastFifteen = encodedAddress.slice(-15);

    return `${firstFifteen}...${lastFifteen}`;
  };

  if (!accounts.length || !freeBalance || !api || !injector) {
    return (
      <Section>
        <Box alignSelf="center">
          <Spinner size="medium" />
        </Box>
      </Section>
    );
  }

  if (isFinalized) {
    return <Success hash={hash} ksmAmount={ksmAmount} />;
  }

  const Error = () => {
    return (
      <Box
        background={{ color: '#FFE8ED' }}
        style={{ width: '500px', padding: '24px', borderRadius: '4px' }}
      >
        <Text weight={600}>
          <Alert size="small" /> Unexpected error!
        </Text>
        <Text>Try again.</Text>
      </Box>
    );
  };

  return (
    <Section gap="medium">
      <Box>
        <Text size="xxlarge" weight={900}>
          Stake Kusama
        </Text>
      </Box>
      {error && <Error />}
      {!isWeb3Injected && (
        <Box gap="medium">
          <Text size="large" weight={400}>
            You need a Polkadot account with a balance of at least 1 Kusama in
            order to stake.
          </Text>
          <ConnectWalletButton />
        </Box>
      )}
      {isWeb3Injected && (
        <Box gap="medium" style={{ width: '500px' }}>
          <FormField label="Kusama account">
            <Select
              disabled={isContributing}
              children={account => (
                <Box pad="small" style={{ textAlign: 'left' }}>
                  <div>
                    {account.meta?.name} - {truncateAddress(account.address)}
                  </div>
                </Box>
              )}
              options={accounts}
              onChange={({ option }) => setSelectedAccount(option)}
              valueKey={'address'}
              valueLabel={
                selectedAccount?.address ? (
                  <Box pad="small" style={{ textAlign: 'left' }}>
                    <div>
                      {selectedAccount.meta?.name} -{' '}
                      {truncateAddress(selectedAccount.address)}
                    </div>
                  </Box>
                ) : (
                  ''
                )
              }
              value={`${selectedAccount.meta?.name} - ${
                selectedAccount.address
              }`}
            />
          </FormField>
          <Box>
            <FormField
              name="kusama"
              htmlFor="kusama"
              label="Staking amount (minimum of 0.1 KSM)"
            >
              <TextInput
                disabled={isContributing}
                icon={
                  <>
                    <Image src={ksm_token_logo} />
                    <span style={{ paddingLeft: '8px' }}>KSM</span>
                  </>
                }
                placeholder="0.1"
                reverse
                id="kusama"
                name="kusama"
                onChange={event => setKsmAmount(event.target.value)}
                value={ksmAmount}
              />
            </FormField>
            <Text>
              <Grid columns={['90px', 'auto']}>
                <Text>Your balance:</Text>
                {balanceLoading ? (
                  <Spinner
                    style={{
                      height: '5px',
                      width: '5px',
                      padding: '7px',
                      marginTop: '3px',
                      marginLeft: '2px',
                    }}
                  />
                ) : (
                  formattedFreeBalance
                )}
              </Grid>
            </Text>
          </Box>
          <CheckBox
            disabled={isContributing}
            checked={checked}
            label="I agree to the terms and conditions here"
            onChange={event => setChecked(event.target.checked)}
          />
          {isContributing ? (
            <Grid columns={['36px', 'auto']}>
              <Spinner />
              <Text>Staking in progress...</Text>
            </Grid>
          ) : (
            <Button
              disabled={disabled}
              primary
              alignSelf="start"
              label="Stake Now"
              style={{ marginTop: '25px' }}
              onClick={() => contribute()}
            />
          )}
        </Box>
      )}
    </Section>
  );
};