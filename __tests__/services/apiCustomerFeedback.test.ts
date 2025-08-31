import { apiCustomerFeedback } from '../../services/apiCustomerFeedback';
import { isFeatureEnabled } from '../../src/lib/feature-flags';

// Mock the feature flags
jest.mock('../../src/lib/feature-flags', () => ({
  isFeatureEnabled: jest.fn()
}));

// Mock Supabase
jest.mock('../../services/supabase', () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null
            }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: null,
                error: null
              }))
            }))
          }))
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: null
          }))
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            or: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn(() => ({
                  data: null,
                  error: null,
                  count: 0
                }))
              }))
            }))
          }))
        })),
        lte: jest.fn(() => ({
          or: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() => ({
                data: null,
                error: null,
                count: 0
              }))
            }))
          }))
        })),
        or: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => ({
              data: null,
              error: null,
              count: 0
            }))
          }))
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            data: null,
            error: null,
            count: 0
          }))
        }))
      }))
    }))
  }
}));

describe('apiCustomerFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockFeedbackSubmission = {
    branch_id: 'test-branch-id',
    customer_name: 'Test Customer',
    phone_number: '+1234567890',
    email: 'test@example.com',
    overall_rating: 4,
    ratings: [
      { category: 'reception', rating: 4 },
      { category: 'order_delivery', rating: 3 },
      { category: 'service_speed', rating: 4 },
      { category: 'food_quality', rating: 4 },
      { category: 'cleanliness', rating: 3 }
    ]
  };

  describe('submitFeedback', () => {
    it('should throw error when feature is disabled', async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(false);
      
      await expect(apiCustomerFeedback.submitFeedback(mockFeedbackSubmission))
        .rejects
        .toThrow('Feedback survey feature is disabled');
    });

    it('should submit feedback when feature is enabled', async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(true);
      
      // Mock successful branch validation
      const mockSupabase = require('../../services/supabase').default;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-branch-id' },
              error: null
            })
          })
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'feedback-id', branch_id: 'test-branch-id' },
              error: null
            })
          })
        })
      });

      const result = await apiCustomerFeedback.submitFeedback(mockFeedbackSubmission);
      
      expect(result).toBeDefined();
      expect(result.branch_id).toBe('test-branch-id');
    });

    it('should validate rating constraints', async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(true);
      
      const invalidFeedback = {
        ...mockFeedbackSubmission,
        overall_rating: 5 // Invalid rating
      };

      await expect(apiCustomerFeedback.submitFeedback(invalidFeedback))
        .rejects
        .toThrow('Overall rating must be between 1 and 4');
    });
  });

  describe('getFeedbackData', () => {
    it('should return empty result when feature is disabled', async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(false);
      
      const result = await apiCustomerFeedback.getFeedbackData();
      expect(result).toEqual({ feedback: [], total: 0 });
    });

    it('should get feedback data when feature is enabled', async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(true);
      
      const mockSupabase = require('../../services/supabase').default;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                or: jest.fn(() => ({
                  order: jest.fn(() => ({
                    range: jest.fn().mockResolvedValue({
                      data: [],
                      error: null,
                      count: 0
                    })
                  }))
                }))
              }))
            }))
          })),
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              or: jest.fn(() => ({
                order: jest.fn(() => ({
                  range: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                    count: 0
                  })
                }))
              }))
            }))
          })),
          lte: jest.fn(() => ({
            or: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                  count: 0
                }))
              }))
            }))
          })),
          or: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn().mockResolvedValue({
                data: [],
                error: null,
                count: 0
              })
            }))
          })),
          order: jest.fn(() => ({
            range: jest.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 0
            })
          }))
        })
      });

      const result = await apiCustomerFeedback.getFeedbackData();
      expect(result).toEqual({ feedback: [], total: 0 });
    });
  });

  describe('getFeedbackById', () => {
    it('should throw error when feature is disabled', async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(false);
      
      await expect(apiCustomerFeedback.getFeedbackById('test-feedback-id'))
        .rejects
        .toThrow('Feedback dashboard feature is disabled');
    });
  });

  describe('getFeedbackAnalytics', () => {
    it('should throw error when feature is disabled', async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(false);
      
      await expect(apiCustomerFeedback.getFeedbackAnalytics())
        .rejects
        .toThrow('Feedback analytics feature is disabled');
    });
  });

  describe('deleteFeedback', () => {
    it('should throw error when feature is disabled', async () => {
      (isFeatureEnabled as jest.Mock).mockReturnValue(false);
      
      await expect(apiCustomerFeedback.deleteFeedback('test-feedback-id'))
        .rejects
        .toThrow('Feedback dashboard feature is disabled');
    });
  });
});
