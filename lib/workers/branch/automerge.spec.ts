import { defaultConfig, getName, git, platform } from '../../../test/util';
import { RenovateConfig } from '../../config';
import { setAdminConfig } from '../../config/admin';
import { BranchStatus } from '../../types';
import { tryBranchAutomerge } from './automerge';

jest.mock('../../util/git');

describe(getName(__filename), () => {
  describe('tryBranchAutomerge', () => {
    let config: RenovateConfig;
    beforeEach(() => {
      config = {
        ...defaultConfig,
      };
      setAdminConfig();
    });
    it('returns false if not configured for automerge', async () => {
      config.automerge = false;
      expect(await tryBranchAutomerge(config)).toBe('no automerge');
    });
    it('returns false if automergeType is pr', async () => {
      config.automerge = true;
      config.automergeType = 'pr';
      expect(await tryBranchAutomerge(config)).toBe('no automerge');
    });
    it('returns false if branch status is not success', async () => {
      config.automerge = true;
      config.automergeType = 'branch';
      platform.getBranchStatus.mockResolvedValueOnce(BranchStatus.yellow);
      expect(await tryBranchAutomerge(config)).toBe('no automerge');
    });
    it('returns branch status error if branch status is failure', async () => {
      config.automerge = true;
      config.automergeType = 'branch';
      platform.getBranchStatus.mockResolvedValueOnce(BranchStatus.red);
      expect(await tryBranchAutomerge(config)).toBe('branch status error');
    });
    it('returns false if PR exists', async () => {
      platform.getBranchPr.mockResolvedValueOnce({} as never);
      config.automerge = true;
      config.automergeType = 'branch';
      platform.getBranchStatus.mockResolvedValueOnce(BranchStatus.green);
      expect(await tryBranchAutomerge(config)).toBe(
        'automerge aborted - PR exists'
      );
    });
    it('returns false if automerge fails', async () => {
      config.automerge = true;
      config.automergeType = 'branch';
      platform.getBranchStatus.mockResolvedValueOnce(BranchStatus.green);
      git.mergeBranch.mockImplementationOnce(() => {
        throw new Error('merge error');
      });
      expect(await tryBranchAutomerge(config)).toBe('failed');
    });
    it('returns true if automerge succeeds', async () => {
      config.automerge = true;
      config.automergeType = 'branch';
      platform.getBranchStatus.mockResolvedValueOnce(BranchStatus.green);
      expect(await tryBranchAutomerge(config)).toBe('automerged');
    });
    it('returns true if automerge succeeds (dry-run)', async () => {
      config.automerge = true;
      config.automergeType = 'branch';
      setAdminConfig({ dryRun: true });
      platform.getBranchStatus.mockResolvedValueOnce(BranchStatus.green);
      expect(await tryBranchAutomerge(config)).toBe('automerged');
    });
  });
});
